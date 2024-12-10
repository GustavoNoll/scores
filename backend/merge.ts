import path from "path";
import fs from "fs";

// Function to merge all scalability results
function main() {
  const resultsDir = path.join(__dirname);
  const files = fs.readdirSync(resultsDir);
  
  // Filter only scalability-results files
  const scalabilityFiles = files.filter(file => 
    file.startsWith('scalability-results-') && file.endsWith('.json')
  );

  // Read and merge all results
  const mergedResults = scalabilityFiles.map(file => {
    const filePath = path.join(resultsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  });

  // Write merged results to new file
  const outputPath = path.join(__dirname, '4_100informs.json');
  fs.writeFileSync(outputPath, JSON.stringify(mergedResults, null, 2));

  // Optionally, remove original files after merging
  scalabilityFiles.forEach(file => {
    fs.unlinkSync(path.join(resultsDir, file));
  });
}

main();