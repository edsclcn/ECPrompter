$(document).ready(function () {
    const table = $('#imageTable').DataTable({
        paging: true,
        searching: true,
        info: true,
        autoWidth: true,
        columnDefs: [
            { orderable: false, targets: 2 }
        ],
        rowReorder: {
            selector: 'td:nth-child(1)',
            update: false,
        }
    });

    let allFiles = [];
    let promptWindow = null;

    $('#imageInput').on('change', function (event) {
        const files = event.target.files;
        allFiles = [...allFiles, ...Array.from(files)];
        Array.from(files).forEach((file, index) => {
            table.row.add([
                '<i class="fa-solid fa-arrows-up-down-left-right"></i>',
                file.name,
                `<button class="preview-btn" data-file-name="${file.name}" style="background-color: #306030;">PROMPT</button>`
            ]).draw();
        });
    });

    $('#imageTable tbody').on('click', 'tr', function () {
        const fileName = table.cell(this, 1).data();
        const file = allFiles.find(f => f.name === fileName);
        if (file) {
            const previewContainer = $('#preview');
            const img = $('<img>').attr('src', URL.createObjectURL(file));
            if (previewContainer.children().length > 0) {
                previewContainer.empty();
            }
            previewContainer.append(img);
        }
    });

    $('#imageTable').on('click', '.preview-btn', function (event) {
        event.stopPropagation();
        $(this).css('background-color', '#e74c3c');
        $('.preview-btn').not(this).css('background-color', '#306030');
        const fileName = $(this).data('file-name');
        const file = allFiles.find(f => f.name === fileName);
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            if (promptWindow && !promptWindow.closed) {
                const imageElement = promptWindow.document.getElementById("imagePrompt");
                imageElement.src = imageUrl;
            } else {
                promptWindow = window.open("", "_blank", "width=800,height=600");
                promptWindow.document.write('<html><head><title>Image Preview</title></head><body style="margin: 0; padding: 0; overflow: hidden;">');
                promptWindow.document.write('<img id="imagePrompt" src="' + imageUrl + '" style="width: 100%; height: auto; display: block;">');
                promptWindow.document.write('</body></html>');
            }
            promptWindow.document.body.addEventListener('keydown', function (e) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    slowScroll(promptWindow);
                }
            });
        }
    });

    function slowScroll(window) {
        let scrollPosition = 0;
        const scrollSpeed = 1;
        function scroll() {
            if (window.document.body) {
                window.scrollBy(0, scrollSpeed);
                scrollPosition += scrollSpeed;
                if (scrollPosition < window.document.body.scrollHeight - window.innerHeight) {
                    requestAnimationFrame(scroll);
                }
            }
        }
        scroll();
    }
});
