export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy"); // @TODO
    document.body.removeChild(textArea);
  }
}

export function isClientSide() {
  return typeof document !== "undefined";
}

export function compressImage(
  base64Image: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create an Image object
    const img = new Image();

    // Set up the onload handler which will resize the image once it's loaded
    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      // Draw the image onto the canvas with the desired dimensions
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas back to a base64-encoded image
        const compressedBase64Image = canvas.toDataURL("image/jpeg");

        resolve(compressedBase64Image);
      } else {
        reject(new Error("Unable to get canvas context"));
      }
    };

    // Set up the onerror handler in case loading the base64 image fails
    img.onerror = (error) => {
      reject(error);
    };

    // Load the image
    img.src = base64Image;
  });
}

export function selectFiles(fileType: string, count = 1): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Create an input element
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = count > 0; // Allow multiple file selection if count > 1
    input.accept = fileType; // Set the desired file types

    // Trigger the file selection dialog
    input.click();

    input.onchange = () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) {
        reject("No files were selected.");
        return;
      }

      // Limit the number of files to the specified count
      const selectedFiles = files.slice(0, count);

      // Read and encode each file as base64
      const readers = selectedFiles.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Convert the file data to a base64 string
            const base64String = reader.result as string;
            resolve(base64String); // Remove the data URL part before the comma
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      // Resolve the promise once all files are read
      Promise.all(readers)
        .then((encodedFiles) => resolve(encodedFiles))
        .catch((error) => reject(error));
    };

    // Handle the case where the user closes the file selector without choosing a file
    input.onerror = () => {
      reject("File selection was cancelled or failed.");
    };
  });
}
