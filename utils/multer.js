const multer = require('multer')
const path = require('path')

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase()

        // Allowed image formats
        const imageFormats = [".jpg", ".jpeg", ".png", ".gif"]

        // Allowed video formats
        const videoFormats = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv", ".webm"]

        // Check if file extension is allowed
        if (!imageFormats.includes(ext) && !videoFormats.includes(ext)) {
            cb(new Error("File type is not supported"), false)
            return
        }
        cb(null, true)
    }
})