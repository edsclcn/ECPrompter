$(document).ready(function () {
    // Initialize DataTable
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

    // Handle file input
    $('#imageInput').on('change', function (event) {
        const files = event.target.files;
        allFiles = [...allFiles, ...Array.from(files)];

        Array.from(files).forEach((file) => {
            table.row.add([
                '<i class="fa-solid fa-arrows-up-down-left-right"></i>',
                file.name,
                `<button class="preview-btn" data-file-name="${file.name}" style="background-color: #306030;">PROMPT</button>`
            ]).draw();
        });
    });

    // Row click preview
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

    // Prompt preview
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
                promptWindow.document.write(`
                    <html>
                        <head><title>Image Preview</title></head>
                        <body style="margin: 0; padding: 0; overflow: hidden; background-color: black;">
                            <img id="imagePrompt" src="${imageUrl}" style="width: 100%; height: auto; display: block; margin: 0 auto;">
                        </body>
                    </html>
                `);

                // Keyboard support after prompt loads
                promptWindow.onload = () => {
                    const doc = promptWindow.document;
                    const body = doc.body;
                    const img = doc.getElementById("imagePrompt");

                    let autoScroll = false;
                    let scrollSpeed = 1;
                    let scrollInterval;
                    let zoom = 1;

                    function startAutoScroll() {
                        stopAutoScroll();
                        scrollInterval = setInterval(() => {
                            promptWindow.scrollBy(0, scrollSpeed);
                        }, 10);
                    }

                    function stopAutoScroll() {
                        clearInterval(scrollInterval);
                    }

                    function toggleAutoScroll() {
                        autoScroll = !autoScroll;
                        autoScroll ? startAutoScroll() : stopAutoScroll();
                    }

                    body.addEventListener('keydown', function (e) {
                        switch (e.code) {
                            case 'Space': // Play/Pause
                                e.preventDefault();
                                toggleAutoScroll();
                                break;
                            case 'ArrowUp':
                                promptWindow.scrollBy(0, -50);
                                break;
                            case 'ArrowDown':
                                promptWindow.scrollBy(0, 50);
                                break;
                            case 'ArrowRight':
                                alert('Next Prompt'); // Placeholder
                                break;
                            case 'ArrowLeft':
                                alert('Previous Prompt'); // Placeholder
                                break;
                            case 'KeyT':
                                promptWindow.scrollTo(0, 0);
                                break;
                            case 'F11':
                            case 'KeyF':
                                promptWindow.document.documentElement.requestFullscreen?.();
                                break;
                            case 'Digit0':
                                stopAutoScroll();
                                break;
                            case 'Digit1': scrollSpeed = 1; break;
                            case 'Digit2': scrollSpeed = 2; break;
                            case 'Digit3': scrollSpeed = 3; break;
                            case 'Digit4': scrollSpeed = 4; break;
                            case 'Digit5': scrollSpeed = 5; break;
                            case 'Digit6': scrollSpeed = 6; break;
                            case 'Digit7': scrollSpeed = 7; break;
                            case 'Digit8': scrollSpeed = 8; break;
                            case 'Digit9': scrollSpeed = 9; break;
                            case 'NumpadAdd': scrollSpeed += 1; break;
                            case 'NumpadSubtract': scrollSpeed = Math.max(1, scrollSpeed - 1); break;
                            case 'Minus':
                                zoom = Math.max(0.1, zoom - 0.1);
                                img.style.width = (zoom * 100) + '%';
                                break;
                            case 'Equal':
                                zoom = zoom + 0.1;
                                img.style.width = (zoom * 100) + '%';
                                break;
                        }
                    });
                };
            }
        }
    });
});
