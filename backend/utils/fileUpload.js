const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Ensure upload directories exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Create upload directories
createDirIfNotExists("./uploads/images")
createDirIfNotExists("./uploads/audio")

// Configure storage for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/images")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
  },
})

// Configure storage for audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/audio")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
  },
})

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

// File filter for audio
const audioFilter = (req, file, cb) => {
  // console.log("audioFilter file:", file);

  // Allow by extension only (most reliable)
  const allowedExt = /mp3|wav|ogg|m4a/;
  const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed!"), false);
  }
}

// Create upload instances
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter,
})

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: audioFilter,
})

// Combined storage for both image and audio
const songStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "cover") {
      cb(null, "./uploads/images");
    } else if (file.fieldname === "audio") {
      cb(null, "./uploads/audio");
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});

const songFileFilter = (req, file, cb) => {
  if (file.fieldname === "cover") {
    imageFilter(req, file, cb);
  } else if (file.fieldname === "audio") {
    audioFilter(req, file, cb);
  } else {
    cb(new Error("Invalid field name"), false);
  }
};

const uploadSongFiles = multer({
  storage: songStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max for any file
  fileFilter: songFileFilter,
});

module.exports = {
  uploadImage,
  uploadAudio,
  uploadSongFiles, // <-- export this
};
