// Tải lên 1 ảnh đơn lẻ
const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Không có file nào được tải lên.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Tải ảnh lên thành công',
      data: {
        url: req.file.path,
        filename: req.file.filename
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra khi tải ảnh lên.',
      error: error.message
    });
  }
};

// Tải lên nhiều ảnh cùng lúc
const uploadImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Không có files nào được tải lên.'
      });
    }

    // Lấy danh sách URL của tất cả các file đã up
    const urls = req.files.map(file => ({
      url: file.path,
      filename: file.filename
    }));

    return res.status(200).json({
      status: 'success',
      message: `Tải lên thành công ${req.files.length} ảnh`,
      data: urls
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra khi tải nhiều ảnh lên.',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage,
  uploadImages
};
