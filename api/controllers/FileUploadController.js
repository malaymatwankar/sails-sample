/**
 * FileUploadController
 *
 * @description :: Server-side logic for managing fileuploads
 *
 */

module.exports = {
  uploadedFile: uploadedFile
};

function uploadedFile(req, res) {
  // Here you can get the whole file object inside req.uploadedFile object which we set in policies/FileUploadPolicy
  // By the time your control comes here file has been uplaoded to
  res.send({
    msg: 'Success',
    description: 'Yaay we uploaded file successfully !!'
  });
}
