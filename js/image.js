$(document).ready(function () {
    // Initialize DataTable with RowReorder functionality
    const table = $('#imageTable').DataTable({
        paging: true, // Enable pagination
        searching: true, // Enable search
        info: true, // Show table info
        autoWidth: true, // Automatically adjust column widths
        columnDefs: [
            { orderable: false, targets: 2 } // Make the "Action" column non-sortable
        ],
        rowReorder: { // Enable row reorder
            selector: 'td:nth-child(1)', // Make the first column the row reorder trigger
            update: false, // Don't update the table immediately
        }
    });

    // Store references to all added files
    let allFiles = [];
    let promptWindow = null; // Store reference to the prompt window

    // Handle file input change
    $('#imageInput').on('change', function (event) {
        const files = event.target.files;

        // Update the file references without clearing the existing ones
        allFiles = [...allFiles, ...Array.from(files)];

        // Populate DataTable with the new files
        Array.from(files).forEach((file, index) => {
            table.row.add([ 
                '<i class="fa-solid fa-arrows-up-down-left-right"></i>', // Use the directional arrow icon
                file.name, // File name
                `<button class="preview-btn" data-file-name="${file.name}" style="background-color: #306030;">PROMPT</button>`
            ]).draw();
        });
    });

    // Row click handler (moved Prompt functionality to row click)
    $('#imageTable tbody').on('click', 'tr', function () {
        // Get the file name from the second column (file name column)
        const fileName = table.cell(this, 1).data();

        // Find the file in the allFiles array based on its name
        const file = allFiles.find(f => f.name === fileName);

        if (file) {
            const previewContainer = $('#preview');
            
            // Create an img element for the selected file
            const img = $('<img>').attr('src', URL.createObjectURL(file));
            
            // Clear previous image, but only if it's the first time the preview is shown
            if (previewContainer.children().length > 0) {
                previewContainer.empty(); // Clear the preview container if an image is already present
            }
            
            // Append the new image to the preview container
            previewContainer.append(img);
        }
    });

    // Prompt button click handler (change color of the button to red and others to green)
    $('#imageTable').on('click', '.preview-btn', function (event) {
        // Prevent the row click event from being triggered when the button is clicked
        event.stopPropagation();

        // Change the clicked button to red
        $(this).css('background-color', '#e74c3c');

        // Reset the color of all other buttons to green
        $('.preview-btn').not(this).css('background-color', '#306030');

        // Open or update the image in the prompt window
        const fileName = $(this).data('file-name');
        const file = allFiles.find(f => f.name === fileName);
        
        if (file) {
            const imageUrl = URL.createObjectURL(file); // Create a URL object for HD image

            // If promptWindow is already open, update the image in the existing window
            if (promptWindow && !promptWindow.closed) {
                const imageElement = promptWindow.document.getElementById("imagePrompt");
                imageElement.src = imageUrl; // Update the image source to ensure HD quality
            } else {
                // Otherwise, create a new window and add the image
                promptWindow = window.open("", "_blank", "width=800,height=600");
                promptWindow.document.write('<html><head><title>Image Preview</title></head><body style="margin: 0; padding: 0; overflow: hidden;">');
                promptWindow.document.write('<img id="imagePrompt" src="' + imageUrl + '" style="width: 100%; height: auto; display: block;">');
                promptWindow.document.write('</body></html>');
            }

            // Add spacebar event listener for auto scroll
            promptWindow.document.body.addEventListener('keydown', function (e) {
                if (e.code === 'Space') {
                    e.preventDefault(); // Prevent the default spacebar behavior
                    slowScroll(promptWindow);
                }
            });
        }
    });

    // Function to implement slow auto-scrolling
    function slowScroll(window) {
        let scrollPosition = 0;
        const scrollSpeed = 1; // Adjust this value for faster/slower scroll

        function scroll() {
            if (window.document.body) {
                window.scrollBy(0, scrollSpeed);
                scrollPosition += scrollSpeed;
                if (scrollPosition < window.document.body.scrollHeight - window.innerHeight) {
                    requestAnimationFrame(scroll); // Keep scrolling slowly
                }
            }
        }

        scroll(); // Start scrolling
    }
});
