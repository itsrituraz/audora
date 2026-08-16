const ImageKit = require('@imagekit/nodejs');

const ImageKitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(file) {
  console.log('Key loaded:', process.env.IMAGEKIT_PRIVATE_KEY ? 'Yes' : 'NO - undefined');
  console.log('Buffer length:', file.length);

  try {
    const result = await ImageKitClient.files.upload({
      file,
      fileName: "music_" + Date.now(),
      folder: "yt-complete-backend/music"
    });
    return result;
  } catch (error) {
    console.log('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw error;
  }
}

async function deleteFile(fileId) {
  try {
    const result = await ImageKitClient.files.delete(fileId);

    return result;
  } catch (error) {
    console.log(
      "ImageKit delete error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );

    throw error;
  }
}

module.exports = { uploadFile,deleteFile };