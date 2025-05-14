const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const { generateExport } = require("./export-layout");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/export-layout", async (req, res) => {
  const elementsData = req.body.elements;

  if (!elementsData) {
    return res
      .status(400)
      .send({ error: "Missing elements data in request body" });
  }

  let tempDirForZip;

  try {
    console.log("Received request to export layout...");
    const zipFilePath = await generateExport(elementsData);
    tempDirForZip = path.dirname(zipFilePath);

    console.log(`Sending zip file: ${zipFilePath}`);

    res.download(zipFilePath, path.basename(zipFilePath), (err) => {
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          res.status(500).send({ error: "Failed to send the zip file." });
        }
      } else {
        console.log("Zip file sent successfully.");
      }
      // Temporarily disable cleanup for debugging build errors
      /*
      if (tempDirForZip) {
        console.log(`[DEBUG] Not cleaning up temporary directory: ${tempDirForZip}`);
        // fs.remove(tempDirForZip).catch((removeErr) => {
        //   console.error(
        //     `Error cleaning up temp directory ${tempDirForZip}:`,
        //     removeErr
        //   );
        // });
      }
      */
    });
  } catch (error) {
    console.error("Failed to generate layout export:", error);
    if (!res.headersSent) {
      res.status(500).send({
        error: "Failed to generate layout export.",
        details: error.message,
      });
    }
    // Temporarily disable cleanup for debugging build errors
    /*
    if (tempDirForZip) {
      console.log(`[DEBUG] Error occurred, not cleaning up: ${tempDirForZip}`);
    //   fs.remove(tempDirForZip).catch((removeErr) => {
    //     console.error(
    //       `Error cleaning up temp directory ${tempDirForZip} after failure:`,
    //       removeErr
    //     );
    //   });
    }
    */
  }
});

app.listen(PORT, () => {
  console.log(`Export server listening on port ${PORT}`);
  console.log(
    `Ready to receive layout data at http://localhost:${PORT}/api/export-layout`
  );
});
