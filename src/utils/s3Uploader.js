const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const uploadToS3 = async (fileBuffer, fileName, mimeType, folder = "images") => {
    const key = `${folder}/${Date.now()}-${fileName}`;
    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
            // ACL: "public-read",
        },
    });

    await upload.done();
    return {
        Location: `${process.env.CLOUDFRONT_DOMAIN}/${key}`,
    };
};

module.exports = { uploadToS3 };
