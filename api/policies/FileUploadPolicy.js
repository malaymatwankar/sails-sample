module.exports = function(req, res, next) {
  // This is the name you give to the tag/HTML element that has the file upload dialogbox
  const fileTagName = req.params['file']; // According to best practices this should be written as req.params.file but here I am expecting the 'image' part to be a variable in future
  // This provides us array of allowed image formats...
  // sails.config.fileUpload.supportedFileFormat comes from config/development.js
  const supportedFileFormat = sails.config.fileUpload.supportedFileFormat; // Currently this resolves to ['png', 'jpg', 'jpeg']
  if (!fileTagName) {
    console.log(`Formname not provided at all`);
    return res.badRequest(generateError('INVALID_FORM_NAME'));
  } else {
    req.file(fileTagName).upload( //{
      //This is sails way to define maxfilesize but I prefer another way used later in this code
      // if(supportedFileFormat.indexOf(file.headers['content-type']) === -1) {
      //    // save as disallowed files default upload path
      //    cb(null,uuid);
      //  }else{
      //    // save as allowed files
      //    cb(null,allowedDir+"/"+uuid);
      //  }
      //},
      {
        //This is sails way to define maxfilesize but I prefer another way used later in this code
        maxBytes: 10
      },
      // Not sails way to do this here we will have to delete file from file system sails has
      function(error, uploadedFile) {
        if (error) {
          console.log("ERROR " + JSON.stringify(error));
          console.log(`Some bad error occurred ${error}`);
          if (error.code === 'E_EXCEEDS_UPLOAD_LIMIT') {
            console.log(`Check by skipper itself...`);
            return res.badRequest(generateError('MAX_FILE_SIZE_EXCEED'));
          } else {
            return res.serverError(generateError('SOMETHING_BAD_HAPPENNED'));
          }
        } else {
          if (uploadedFile.length === 0) {
            console.log(`No file was provided`);
            return res.badRequest(generateError('NO_FILE_PROVIDED'));
          } else {
            if (supportedFileFormat.indexOf(req.file(fileTagName)._files[0].stream.headers['content-type']) === -1) {
              console.log(`File format not supported input file was of type ${req.file(fileTagName)._files[0].stream.headers['content-type']}`);
              return res.badRequest(generateError('INVALID_FILE_TYPE'));
            } else if (req.file(fileTagName)._files[0].stream.byteCount > sails.config.fileUpload.maxFileSize) {
              // This check is fail safe for maxBytes as shown file gets uploaded in both cases...
              console.log(`File size is more than expected...`);
              return res.badRequest(generateError('MAX_FILE_SIZE_EXCEED'));
            } else {
              req.uploadedFile = uploadedFile;
              return next();
            }
          }
        }
      });
  }
};


// This is not a cleaner function this could be refactored to be more generic and avoid redundency...
function generateError(errorMessage) {
  console.log(`This is error in fileUpload.policy ${errorMessage}`);
  const errorObject = {
    INVALID_FORM_NAME: {
      msg: "Provide Valid From Name",
      details: "Name of the tag should be image..."
    },
    SOMETHING_BAD_HAPPENNED: {
      msg: "Oops something went wrong",
      details: "Someone from server caught cold, please try after sometime"
    },
    NO_FILE_PROVIDED: {
      msg: "Empty request",
      details: "Please provide the file to be uploaded"
    },
    INVALID_FILE_TYPE: {
      msg: "Invalid File",
      details: "Provided file should be one of " + sails.config.fileUpload.supportedFileFormat
    },
    MAX_FILE_SIZE_EXCEED: {
      msg: "File too large",
      details: "File is too large please keep it less than 2MB"
    }
  };
  // Return the relevant error and if it is none of the above then default to SOMETHING_BAD_HAPPENNED
  return (errorObject[errorMessage]) ? errorObject[errorMessage] : errorObject['SOMETHING_BAD_HAPPENNED'];
}
