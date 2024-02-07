const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

// Security measures
app.use(helmet()); // Sets various HTTP headers to help secure your app
app.use(express.json({
    limit: '10kb' // Body limit is 10
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.post('/create-project', (req, res) => {
  const { projectName, fieldName } = req.body;

  // Validate input
  if (!projectName || !fieldName) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  // Clone the existing Strapi project
  exec(`git clone https://github.com/fuqeera/Builder-NewProject.git ${projectName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return res.status(500).json({ message: 'Server error' });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ message: 'Server error' });
    }

    // Customize the project based on the options
    const filePath = path.join(__dirname, projectName, 'api', 'your-model', 'models', 'your-model.settings.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`error: ${err.message}`);
        return res.status(500).json({ message: 'Server error' });
      }

      let settings;
      try {
        settings = JSON.parse(data);
      } catch (err) {
        console.error(`error: ${err.message}`);
        return res.status(500).json({ message: 'Server error' });
      }

      settings.attributes[fieldName] = { type: 'string' }; // Customize this as per your needs

      fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(`error: ${err.message}`);
          return res.status(500).json({ message: 'Server error' });
        }

        res.send({ success: true });
      });
    });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});