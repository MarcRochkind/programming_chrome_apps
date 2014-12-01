"use strict";

/*
	http://code.flickr.net/author/mustardpizza/
	http://www.media.mit.edu/pia/Research/deepview/exif.html
	http://www.w3.org/Graphics/JPEG/jfif3.pdf
	http://www.fileformat.info/format/jpeg/egff.htm
	http://partners.adobe.com/public/developer/en/tiff/TIFF6.pdf
*/
var ExifData = (function () {

var EXIF_LIMIT = 65536; // assume EXIF and thumbnail in first 64K
var tagJPEGInterchangeFormat = 513;
var tagJPEGInterchangeFormatLength = 514;
var tagExifTag = 34665;

// http://stackoverflow.com/questions/8153725/how-to-use-strings-with-javascript-typed-arrays
DataView.prototype.getUTF8String = function(offset, length) {
    var utf16 = new ArrayBuffer(length * 2);
    var utf16View = new Uint16Array(utf16);
    for (var i = 0; i < length; ++i) {
        utf16View[i] = this.getUint8(offset + i);
    }
    return String.fromCharCode.apply(null, utf16View);
};

var api = {
	Exif: function (fileEntry) {
		this.fileEntry = fileEntry;
	}
};

api.Exif.prototype.getMetadata = function (callback) {
	var that = this;
	that.jpegThumbnailStart = null;
	this.fileEntry.file(
		function (file) {
			var b = file.slice(0, EXIF_LIMIT);
			var reader = new FileReader();
			reader.onloadend = function() {
				that.data = reader.result;
				var d = new DataView(that.data, 0, 6);
				if (d.getUint8(0) != 0xFF || d.getUint8(1) != 0xD8 || d.getUint8(2) != 0xFF) {
					callback();
					return;
				}
				switch (d.getUint8(3)) {
				case 0xE0: // JFIF
					that.exifString = that.decodeJFIF();
					if (that.jpegThumbnailStart && that.jpegThumbnailLen)
						that.showThumbnail(callback);
					else
						callback(that.exifString, null);
					break;
				case 0xE1: // EXIF
					that.exifString = that.decodeExif(2);
					if (that.jpegThumbnailStart && that.jpegThumbnailLen)
						that.showThumbnail(callback);
					else
						callback(that.exifString, null);
				}
			};
			reader.onerror = function (e) {
				console.log(e);
				callback();
			}
			reader.readAsArrayBuffer(b);
		}
	);
};

api.Exif.prototype.decodeExif = function (app1Offset) {
	var that = this;

	var app1 = new DataView(that.data, app1Offset, 10);
	var size = app1.getUint16(2);
	if (app1.getUTF8String(4, 4) !== 'Exif') {
		return null;
	}
	app1 = new DataView(that.data, app1Offset, size);
	var tiffOffset = 10; // offset of endian bytes relative to app1Offset
	var littleEndian = String.fromCharCode(app1.getUint8(tiffOffset)) === 'I';
	if (app1.getUint16(tiffOffset + 2, littleEndian) != 42) {
		return null;
	}
	var ifdOffset = app1.getUint32(tiffOffset + 4, littleEndian);
	var exifDict = [];
	that.tiffBase = app1Offset + 10;
	var nextIFD = ifdOffset; // relative to that.tiffBase
	while (nextIFD)
		nextIFD = that.processIFD(exifDict, nextIFD, littleEndian);
	return exifDict.join('\n');
}

api.Exif.prototype.decodeJFIF = function () {
	var that = this;
	var app0 = new DataView(that.data, 2, 18);
	var size = app0.getUint16(2);
	if (app0.getUTF8String(4, 4) !== 'JFIF')
		return null;
	var version1 = app0.getUint8(9);
	var version2 = app0.getUint8(10);
	var units = app0.getUint8(11);
	var xDensity = app0.getUint16(12);
	var yDensity = app0.getUint16(14);
	var xThumbnail = app0.getUint8(16);
	var yThumbnail = app0.getUint8(17);
	var segLen = size;
	var offset = 4;
	var count = 0;
	var exifDict = [];
	while (segLen > 0) {
		offset += segLen;
		var r = that.getJFIFseg(exifDict, offset);
		segLen = r[0];
		if (r[1])
			return r[1];
		if (count++ > 20) // prevent runaway
			break;
	}
}

api.Exif.prototype.getJFIFseg = function (exifDict, offset) {
	var that = this;
	var seg = new DataView(that.data, offset, 4);
	var len = seg.getUint16(2);
	if (seg.getUint8(0) == 0xFF) {
		if (seg.getUint8(1) == 0xE1) {
			var exifSeg = new DataView(that.data, offset + 4, len);
			return [0, that.decodeExif(offset)];
		}
		return [len + 2, null];
	}
	return [0, null];
}

api.Exif.prototype.processIFD = function (exifDict, ifdOffset, littleEndian) {
	var that = this;
	var ifd = new DataView(that.data, that.tiffBase + ifdOffset, 2);
	var numDEs = ifd.getUint16(0, littleEndian);
	var startDE = 2;
	var nextIFDindex = startDE + numDEs * 12;
	var ifdLen = nextIFDindex + 4;
	ifd = new DataView(that.data, that.tiffBase + ifdOffset, ifdLen);
	for (var i = 0; i < numDEs; i++) {
		var offsetDE = startDE + i * 12;
		that.showDE(exifDict, ifd, offsetDE, littleEndian);
	}
	return ifd.getUint32(nextIFDindex, littleEndian);
}

api.Exif.prototype.showDE = function (exifDict, ifd, offsetDE, littleEndian) {
	var that = this;
	var tag = ifd.getUint16(offsetDE, littleEndian);
	var format = ifd.getUint16(offsetDE + 2, littleEndian);
	var numComponents = ifd.getUint32(offsetDE + 4, littleEndian);
	var valOffset = offsetDE + 8;
	var val = ifd.getUint32(valOffset, littleEndian);
	var tagName = '?';
	that.exiftags.some(
		function (t) {
			if (t.tag === tag) {
				tagName = t.name;
				return true;
			}
		}
	);
	var valInterpreted = that.interpretValue(format, numComponents, val, littleEndian, ifd, valOffset);
	if (tag === tagJPEGInterchangeFormat)
		that.jpegThumbnailStart = parseInt(valInterpreted);
	else if (tag === tagJPEGInterchangeFormatLength)
		that.jpegThumbnailLen = parseInt(valInterpreted);
	exifDict.push(tagName + ': ' + valInterpreted);
	if (tag === tagExifTag) {
		var nextIFD = val;
		while (nextIFD)
			nextIFD = that.processIFD(exifDict, nextIFD, littleEndian);
	}
}

api.Exif.prototype.interpretValue = function (format, numComponents, val, littleEndian, ifd, valOffset) {
	var that = this;
	var formatName = '?';
	var formatLen = 0;
	that.exifformats.some(
		function (f) {
			if (f.format === format) {
				formatName = f.name;
				formatLen = f.len;
				return true;
			}
		}
	);
	var totalLen = numComponents * formatLen;
	if (totalLen <= 4) {
		if (formatName === 'ASCII')
			return ifd.getUTF8String(valOffset, numComponents);
		else
			return val.toString();
	}
	var d = new DataView(that.data, that.tiffBase + val, totalLen);
	switch (formatName) {
	case 'ASCII':
		return d.getUTF8String(0, numComponents);
	case 'RATIONAL':
		var numerator = d.getUint32(0, littleEndian);
		var denominator = d.getUint32(4, littleEndian);
		return numerator.toString() + '/' + denominator.toString();
	case 'SRATIONAL':
		var numerator = d.getInt32(0, littleEndian);
		var denominator = d.getInt32(4, littleEndian);
		return numerator.toString() + '/' + denominator.toString();
	default:
		return 'format not implemented';
	}
}

api.Exif.prototype.showThumbnail = function (callback) {
	var that = this;
	var arrayBufferThumb = that.data.slice(that.tiffBase + that.jpegThumbnailStart, that.tiffBase + that.jpegThumbnailStart + that.jpegThumbnailLen);
	var blobThumb = new Blob([arrayBufferThumb], { type: 'image/jpeg' });
	var reader = new FileReader();
	reader.onload = function() {
// 		document.querySelector('#img').src = reader.result;
		callback(that.exifString, reader.result);
	};
	reader.readAsDataURL(blobThumb);
}

api.Exif.prototype.exiftags = [
	{ tag: 11, name: "Exif.Image.ProcessingSoftware" },
	{ tag: 254, name: "Exif.Image.NewSubfileType" },
	{ tag: 255, name: "Exif.Image.SubfileType" },
	{ tag: 256, name: "Exif.Image.ImageWidth" },
	{ tag: 257, name: "Exif.Image.ImageLength" },
	{ tag: 258, name: "Exif.Image.BitsPerSample" },
	{ tag: 259, name: "Exif.Image.Compression" },
	{ tag: 262, name: "Exif.Image.PhotometricInterpretation" },
	{ tag: 263, name: "Exif.Image.Threshholding" },
	{ tag: 264, name: "Exif.Image.CellWidth" },
	{ tag: 265, name: "Exif.Image.CellLength" },
	{ tag: 266, name: "Exif.Image.FillOrder" },
	{ tag: 269, name: "Exif.Image.DocumentName" },
	{ tag: 270, name: "Exif.Image.ImageDescription" },
	{ tag: 271, name: "Exif.Image.Make" },
	{ tag: 272, name: "Exif.Image.Model" },
	{ tag: 273, name: "Exif.Image.StripOffsets" },
	{ tag: 274, name: "Exif.Image.Orientation" },
	{ tag: 277, name: "Exif.Image.SamplesPerPixel" },
	{ tag: 278, name: "Exif.Image.RowsPerStrip" },
	{ tag: 279, name: "Exif.Image.StripByteCounts" },
	{ tag: 282, name: "Exif.Image.XResolution" },
	{ tag: 283, name: "Exif.Image.YResolution" },
	{ tag: 284, name: "Exif.Image.PlanarConfiguration" },
	{ tag: 290, name: "Exif.Image.GrayResponseUnit" },
	{ tag: 291, name: "Exif.Image.GrayResponseCurve" },
	{ tag: 292, name: "Exif.Image.T4Options" },
	{ tag: 293, name: "Exif.Image.T6Options" },
	{ tag: 296, name: "Exif.Image.ResolutionUnit" },
	{ tag: 301, name: "Exif.Image.TransferFunction" },
	{ tag: 305, name: "Exif.Image.Software" },
	{ tag: 306, name: "Exif.Image.DateTime" },
	{ tag: 315, name: "Exif.Image.Artist" },
	{ tag: 316, name: "Exif.Image.HostComputer" },
	{ tag: 317, name: "Exif.Image.Predictor" },
	{ tag: 318, name: "Exif.Image.WhitePoint" },
	{ tag: 319, name: "Exif.Image.PrimaryChromaticities" },
	{ tag: 320, name: "Exif.Image.ColorMap" },
	{ tag: 321, name: "Exif.Image.HalftoneHints" },
	{ tag: 322, name: "Exif.Image.TileWidth" },
	{ tag: 323, name: "Exif.Image.TileLength" },
	{ tag: 324, name: "Exif.Image.TileOffsets" },
	{ tag: 325, name: "Exif.Image.TileByteCounts" },
	{ tag: 330, name: "Exif.Image.SubIFDs" },
	{ tag: 332, name: "Exif.Image.InkSet" },
	{ tag: 333, name: "Exif.Image.InkNames" },
	{ tag: 334, name: "Exif.Image.NumberOfInks" },
	{ tag: 336, name: "Exif.Image.DotRange" },
	{ tag: 337, name: "Exif.Image.TargetPrinter" },
	{ tag: 338, name: "Exif.Image.ExtraSamples" },
	{ tag: 339, name: "Exif.Image.SampleFormat" },
	{ tag: 340, name: "Exif.Image.SMinSampleValue" },
	{ tag: 341, name: "Exif.Image.SMaxSampleValue" },
	{ tag: 342, name: "Exif.Image.TransferRange" },
	{ tag: 343, name: "Exif.Image.ClipPath" },
	{ tag: 344, name: "Exif.Image.XClipPathUnits" },
	{ tag: 345, name: "Exif.Image.YClipPathUnits" },
	{ tag: 346, name: "Exif.Image.Indexed" },
	{ tag: 347, name: "Exif.Image.JPEGTables" },
	{ tag: 351, name: "Exif.Image.OPIProxy" },
	{ tag: 512, name: "Exif.Image.JPEGProc" },
	{ tag: 513, name: "Exif.Image.JPEGInterchangeFormat" },
	{ tag: 514, name: "Exif.Image.JPEGInterchangeFormatLength" },
	{ tag: 515, name: "Exif.Image.JPEGRestartInterval" },
	{ tag: 517, name: "Exif.Image.JPEGLosslessPredictors" },
	{ tag: 518, name: "Exif.Image.JPEGPointTransforms" },
	{ tag: 519, name: "Exif.Image.JPEGQTables" },
	{ tag: 520, name: "Exif.Image.JPEGDCTables" },
	{ tag: 521, name: "Exif.Image.JPEGACTables" },
	{ tag: 529, name: "Exif.Image.YCbCrCoefficients" },
	{ tag: 530, name: "Exif.Image.YCbCrSubSampling" },
	{ tag: 531, name: "Exif.Image.YCbCrPositioning" },
	{ tag: 532, name: "Exif.Image.ReferenceBlackWhite" },
	{ tag: 700, name: "Exif.Image.XMLPacket" },
	{ tag: 18246, name: "Exif.Image.Rating" },
	{ tag: 18249, name: "Exif.Image.RatingPercent" },
	{ tag: 32781, name: "Exif.Image.ImageID" },
	{ tag: 33421, name: "Exif.Image.CFARepeatPatternDim" },
	{ tag: 33422, name: "Exif.Image.CFAPattern" },
	{ tag: 33423, name: "Exif.Image.BatteryLevel" },
	{ tag: 33432, name: "Exif.Image.Copyright" },
	{ tag: 33434, name: "Exif.Image.ExposureTime" },
	{ tag: 33437, name: "Exif.Image.FNumber" },
	{ tag: 33723, name: "Exif.Image.IPTCNAA" },
	{ tag: 34377, name: "Exif.Image.ImageResources" },
	{ tag: 34665, name: "Exif.Image.ExifTag" },
	{ tag: 34675, name: "Exif.Image.InterColorProfile" },
	{ tag: 34850, name: "Exif.Image.ExposureProgram" },
	{ tag: 34852, name: "Exif.Image.SpectralSensitivity" },
	{ tag: 34853, name: "Exif.Image.GPSTag" },
	{ tag: 34855, name: "Exif.Image.ISOSpeedRatings" },
	{ tag: 34856, name: "Exif.Image.OECF" },
	{ tag: 34857, name: "Exif.Image.Interlace" },
	{ tag: 34858, name: "Exif.Image.TimeZoneOffset" },
	{ tag: 34859, name: "Exif.Image.SelfTimerMode" },
	{ tag: 36867, name: "Exif.Image.DateTimeOriginal" },
	{ tag: 37122, name: "Exif.Image.CompressedBitsPerPixel" },
	{ tag: 37377, name: "Exif.Image.ShutterSpeedValue" },
	{ tag: 37378, name: "Exif.Image.ApertureValue" },
	{ tag: 37379, name: "Exif.Image.BrightnessValue" },
	{ tag: 37380, name: "Exif.Image.ExposureBiasValue" },
	{ tag: 37381, name: "Exif.Image.MaxApertureValue" },
	{ tag: 37382, name: "Exif.Image.SubjectDistance" },
	{ tag: 37383, name: "Exif.Image.MeteringMode" },
	{ tag: 37384, name: "Exif.Image.LightSource" },
	{ tag: 37385, name: "Exif.Image.Flash" },
	{ tag: 37386, name: "Exif.Image.FocalLength" },
	{ tag: 37387, name: "Exif.Image.FlashEnergy" },
	{ tag: 37388, name: "Exif.Image.SpatialFrequencyResponse" },
	{ tag: 37389, name: "Exif.Image.Noise" },
	{ tag: 37390, name: "Exif.Image.FocalPlaneXResolution" },
	{ tag: 37391, name: "Exif.Image.FocalPlaneYResolution" },
	{ tag: 37392, name: "Exif.Image.FocalPlaneResolutionUnit" },
	{ tag: 37393, name: "Exif.Image.ImageNumber" },
	{ tag: 37394, name: "Exif.Image.SecurityClassification" },
	{ tag: 37395, name: "Exif.Image.ImageHistory" },
	{ tag: 37396, name: "Exif.Image.SubjectLocation" },
	{ tag: 37397, name: "Exif.Image.ExposureIndex" },
	{ tag: 37398, name: "Exif.Image.TIFFEPStandardID" },
	{ tag: 37399, name: "Exif.Image.SensingMethod" },
	{ tag: 40091, name: "Exif.Image.XPTitle" },
	{ tag: 40092, name: "Exif.Image.XPComment" },
	{ tag: 40093, name: "Exif.Image.XPAuthor" },
	{ tag: 40094, name: "Exif.Image.XPKeywords" },
	{ tag: 40095, name: "Exif.Image.XPSubject" },
	{ tag: 50341, name: "Exif.Image.PrintImageMatching" },
	{ tag: 50706, name: "Exif.Image.DNGVersion" },
	{ tag: 50707, name: "Exif.Image.DNGBackwardVersion" },
	{ tag: 50708, name: "Exif.Image.UniqueCameraModel" },
	{ tag: 50709, name: "Exif.Image.LocalizedCameraModel" },
	{ tag: 50710, name: "Exif.Image.CFAPlaneColor" },
	{ tag: 50711, name: "Exif.Image.CFALayout" },
	{ tag: 50712, name: "Exif.Image.LinearizationTable" },
	{ tag: 50713, name: "Exif.Image.BlackLevelRepeatDim" },
	{ tag: 50714, name: "Exif.Image.BlackLevel" },
	{ tag: 50715, name: "Exif.Image.BlackLevelDeltaH" },
	{ tag: 50716, name: "Exif.Image.BlackLevelDeltaV" },
	{ tag: 50717, name: "Exif.Image.WhiteLevel" },
	{ tag: 50718, name: "Exif.Image.DefaultScale" },
	{ tag: 50719, name: "Exif.Image.DefaultCropOrigin" },
	{ tag: 50720, name: "Exif.Image.DefaultCropSize" },
	{ tag: 50721, name: "Exif.Image.ColorMatrix1" },
	{ tag: 50722, name: "Exif.Image.ColorMatrix2" },
	{ tag: 50723, name: "Exif.Image.CameraCalibration1" },
	{ tag: 50724, name: "Exif.Image.CameraCalibration2" },
	{ tag: 50725, name: "Exif.Image.ReductionMatrix1" },
	{ tag: 50726, name: "Exif.Image.ReductionMatrix2" },
	{ tag: 50727, name: "Exif.Image.AnalogBalance" },
	{ tag: 50728, name: "Exif.Image.AsShotNeutral" },
	{ tag: 50729, name: "Exif.Image.AsShotWhiteXY" },
	{ tag: 50730, name: "Exif.Image.BaselineExposure" },
	{ tag: 50731, name: "Exif.Image.BaselineNoise" },
	{ tag: 50732, name: "Exif.Image.BaselineSharpness" },
	{ tag: 50733, name: "Exif.Image.BayerGreenSplit" },
	{ tag: 50734, name: "Exif.Image.LinearResponseLimit" },
	{ tag: 50735, name: "Exif.Image.CameraSerialNumber" },
	{ tag: 50736, name: "Exif.Image.LensInfo" },
	{ tag: 50737, name: "Exif.Image.ChromaBlurRadius" },
	{ tag: 50738, name: "Exif.Image.AntiAliasStrength" },
	{ tag: 50739, name: "Exif.Image.ShadowScale" },
	{ tag: 50740, name: "Exif.Image.DNGPrivateData" },
	{ tag: 50741, name: "Exif.Image.MakerNoteSafety" },
	{ tag: 50778, name: "Exif.Image.CalibrationIlluminant1" },
	{ tag: 50779, name: "Exif.Image.CalibrationIlluminant2" },
	{ tag: 50780, name: "Exif.Image.BestQualityScale" },
	{ tag: 50781, name: "Exif.Image.RawDataUniqueID" },
	{ tag: 50827, name: "Exif.Image.OriginalRawFileName" },
	{ tag: 50828, name: "Exif.Image.OriginalRawFileData" },
	{ tag: 50829, name: "Exif.Image.ActiveArea" },
	{ tag: 50830, name: "Exif.Image.MaskedAreas" },
	{ tag: 50831, name: "Exif.Image.AsShotICCProfile" },
	{ tag: 50832, name: "Exif.Image.AsShotPreProfileMatrix" },
	{ tag: 50833, name: "Exif.Image.CurrentICCProfile" },
	{ tag: 50834, name: "Exif.Image.CurrentPreProfileMatrix" },
	{ tag: 50879, name: "Exif.Image.ColorimetricReference" },
	{ tag: 50931, name: "Exif.Image.CameraCalibrationSignature" },
	{ tag: 50932, name: "Exif.Image.ProfileCalibrationSignature" },
	{ tag: 50934, name: "Exif.Image.AsShotProfileName" },
	{ tag: 50935, name: "Exif.Image.NoiseReductionApplied" },
	{ tag: 50936, name: "Exif.Image.ProfileName" },
	{ tag: 50937, name: "Exif.Image.ProfileHueSatMapDims" },
	{ tag: 50938, name: "Exif.Image.ProfileHueSatMapData1" },
	{ tag: 50939, name: "Exif.Image.ProfileHueSatMapData2" },
	{ tag: 50940, name: "Exif.Image.ProfileToneCurve" },
	{ tag: 50941, name: "Exif.Image.ProfileEmbedPolicy" },
	{ tag: 50942, name: "Exif.Image.ProfileCopyright" },
	{ tag: 50964, name: "Exif.Image.ForwardMatrix1" },
	{ tag: 50965, name: "Exif.Image.ForwardMatrix2" },
	{ tag: 50966, name: "Exif.Image.PreviewApplicationName" },
	{ tag: 50967, name: "Exif.Image.PreviewApplicationVersion" },
	{ tag: 50968, name: "Exif.Image.PreviewSettingsName" },
	{ tag: 50969, name: "Exif.Image.PreviewSettingsDigest" },
	{ tag: 50970, name: "Exif.Image.PreviewColorSpace" },
	{ tag: 50971, name: "Exif.Image.PreviewDateTime" },
	{ tag: 50972, name: "Exif.Image.RawImageDigest" },
	{ tag: 50973, name: "Exif.Image.OriginalRawFileDigest" },
	{ tag: 50974, name: "Exif.Image.SubTileBlockSize" },
	{ tag: 50975, name: "Exif.Image.RowInterleaveFactor" },
	{ tag: 50981, name: "Exif.Image.ProfileLookTableDims" },
	{ tag: 50982, name: "Exif.Image.ProfileLookTableData" },
	{ tag: 51008, name: "Exif.Image.OpcodeList1" },
	{ tag: 51009, name: "Exif.Image.OpcodeList2" },
	{ tag: 51022, name: "Exif.Image.OpcodeList3" },
	{ tag: 51041, name: "Exif.Image.NoiseProfile" },
	{ tag: 33434, name: "Exif.Photo.ExposureTime" },
	{ tag: 33437, name: "Exif.Photo.FNumber" },
	{ tag: 34850, name: "Exif.Photo.ExposureProgram" },
	{ tag: 34852, name: "Exif.Photo.SpectralSensitivity" },
	{ tag: 34855, name: "Exif.Photo.ISOSpeedRatings" },
	{ tag: 34856, name: "Exif.Photo.OECF" },
	{ tag: 34864, name: "Exif.Photo.SensitivityType" },
	{ tag: 34865, name: "Exif.Photo.StandardOutputSensitivity" },
	{ tag: 34866, name: "Exif.Photo.RecommendedExposureIndex" },
	{ tag: 34867, name: "Exif.Photo.ISOSpeed" },
	{ tag: 34868, name: "Exif.Photo.ISOSpeedLatitudeyyy" },
	{ tag: 34869, name: "Exif.Photo.ISOSpeedLatitudezzz" },
	{ tag: 36864, name: "Exif.Photo.ExifVersion" },
	{ tag: 36867, name: "Exif.Photo.DateTimeOriginal" },
	{ tag: 36868, name: "Exif.Photo.DateTimeDigitized" },
	{ tag: 37121, name: "Exif.Photo.ComponentsConfiguration" },
	{ tag: 37122, name: "Exif.Photo.CompressedBitsPerPixel" },
	{ tag: 37377, name: "Exif.Photo.ShutterSpeedValue" },
	{ tag: 37378, name: "Exif.Photo.ApertureValue" },
	{ tag: 37379, name: "Exif.Photo.BrightnessValue" },
	{ tag: 37380, name: "Exif.Photo.ExposureBiasValue" },
	{ tag: 37381, name: "Exif.Photo.MaxApertureValue" },
	{ tag: 37382, name: "Exif.Photo.SubjectDistance" },
	{ tag: 37383, name: "Exif.Photo.MeteringMode" },
	{ tag: 37384, name: "Exif.Photo.LightSource" },
	{ tag: 37385, name: "Exif.Photo.Flash" },
	{ tag: 37386, name: "Exif.Photo.FocalLength" },
	{ tag: 37396, name: "Exif.Photo.SubjectArea" },
	{ tag: 37500, name: "Exif.Photo.MakerNote" },
	{ tag: 37510, name: "Exif.Photo.UserComment" },
	{ tag: 37520, name: "Exif.Photo.SubSecTime" },
	{ tag: 37521, name: "Exif.Photo.SubSecTimeOriginal" },
	{ tag: 37522, name: "Exif.Photo.SubSecTimeDigitized" },
	{ tag: 40960, name: "Exif.Photo.FlashpixVersion" },
	{ tag: 40961, name: "Exif.Photo.ColorSpace" },
	{ tag: 40962, name: "Exif.Photo.PixelXDimension" },
	{ tag: 40963, name: "Exif.Photo.PixelYDimension" },
	{ tag: 40964, name: "Exif.Photo.RelatedSoundFile" },
	{ tag: 40965, name: "Exif.Photo.InteroperabilityTag" },
	{ tag: 41483, name: "Exif.Photo.FlashEnergy" },
	{ tag: 41484, name: "Exif.Photo.SpatialFrequencyResponse" },
	{ tag: 41486, name: "Exif.Photo.FocalPlaneXResolution" },
	{ tag: 41487, name: "Exif.Photo.FocalPlaneYResolution" },
	{ tag: 41488, name: "Exif.Photo.FocalPlaneResolutionUnit" },
	{ tag: 41492, name: "Exif.Photo.SubjectLocation" },
	{ tag: 41493, name: "Exif.Photo.ExposureIndex" },
	{ tag: 41495, name: "Exif.Photo.SensingMethod" },
	{ tag: 41728, name: "Exif.Photo.FileSource" },
	{ tag: 41729, name: "Exif.Photo.SceneType" },
	{ tag: 41730, name: "Exif.Photo.CFAPattern" },
	{ tag: 41985, name: "Exif.Photo.CustomRendered" },
	{ tag: 41986, name: "Exif.Photo.ExposureMode" },
	{ tag: 41987, name: "Exif.Photo.WhiteBalance" },
	{ tag: 41988, name: "Exif.Photo.DigitalZoomRatio" },
	{ tag: 41989, name: "Exif.Photo.FocalLengthIn35mmFilm" },
	{ tag: 41990, name: "Exif.Photo.SceneCaptureType" },
	{ tag: 41991, name: "Exif.Photo.GainControl" },
	{ tag: 41992, name: "Exif.Photo.Contrast" },
	{ tag: 41993, name: "Exif.Photo.Saturation" },
	{ tag: 41994, name: "Exif.Photo.Sharpness" },
	{ tag: 41995, name: "Exif.Photo.DeviceSettingDescription" },
	{ tag: 41996, name: "Exif.Photo.SubjectDistanceRange" },
	{ tag: 42016, name: "Exif.Photo.ImageUniqueID" },
	{ tag: 42032, name: "Exif.Photo.CameraOwnerName" },
	{ tag: 42033, name: "Exif.Photo.BodySerialNumber" },
	{ tag: 42034, name: "Exif.Photo.LensSpecification" },
	{ tag: 42035, name: "Exif.Photo.LensMake" },
	{ tag: 42036, name: "Exif.Photo.LensModel" },
	{ tag: 42037, name: "Exif.Photo.LensSerialNumber" }
];

api.Exif.prototype.exifformats = [
	{ format: 1, name: "BYTE", len: 1 }, // An 8-bit unsigned integer
	{ format: 2, name: "ASCII", len: 1 }, // An 8-bit byte containing one 7-bit ASCII code. The final byte is terminated with NULL.
	{ format: 3, name: "SHORT", len: 2 }, // A 16-bit (2-byte) unsigned integer
	{ format: 4, name: "LONG", len: 4 }, // A 32-bit (4-byte) unsigned integer
	{ format: 5, name: "RATIONAL", len: 8 }, // Two LONGs. The first LONG is the numerator and the second LONG expresses the denominator.
	{ format: 7, name: "UNDEFINED", len: 1 }, // An 8-bit byte that can take any value depending on the field definition
	{ format: 9, name: "SLONG", len: 4 }, // A 32-bit (4-byte) signed integer (2′s complement notation)
	{ format: 10, name: "SRATIONAL", len: 8 } // Two SLONGs. The first SLONG is the numerator and the second SLONG is the denominator
];

return api;

})();

