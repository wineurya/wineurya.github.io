$(document).ready(function () {
    var maxResultsPerPage = 10; // num of results per page
    var maxPages = 5; // limit max pages to display in dropdown
    var currentPage = 1; // start on page 1 by default
    var totalResults = 0; // track total results for pagination

    // if on home_m2.html, handle search functionality
    if (window.location.pathname.includes("home_m2.html")) {
        $('#searchButton').on('click', function () {
            performSearch(); // call search on click
        });

        $('#searchTerm').on('keypress', function (event) {
            if (event.which === 13) { // enter key pressed
                performSearch(); // call search on enter
            }
        });

        // main search function to fetch and display results
        function performSearch() {
            var searchTerm = $('#searchTerm').val().trim(); // get input
            if (searchTerm !== "") { // only search if not empty
                var startIndex = (currentPage - 1) * maxResultsPerPage;
                var searchURL = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&startIndex=${startIndex}&maxResults=${maxResultsPerPage}&key=AIzaSyBQc2lufwPOt41iTkjRlH_Oo2IXpN-n3b8`;

                // get json data from api
                $.getJSON(searchURL, function (data) {
                    $('#searchResults').empty(); // clear previous results
                    $('#pagination').empty(); // clear old pagination
                    totalResults = data.totalItems || 0; // set total items

                    $('#resultsHeader').text("Search Results").show(); // show header
                    $('#pageLabel').show(); // show label for pages

                    if (data.items && data.items.length > 0) { // check if results
                        data.items.forEach(function (item) { // loop through results
                            // add each book to results section
                            $('#searchResults').append(`
                                <div class="book-item">
                                    <img src="${item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : ''}" alt="${item.volumeInfo.title}">
                                    <h3>${item.volumeInfo.title}</h3>
                                    <a href="details_m2.html?id=${item.id}" class="book-link">View Details</a>
                                </div>
                            `);
                        });

                        if (totalResults > maxResultsPerPage) {
                            generatePageDropdown(totalResults, maxResultsPerPage); // create page dropdown if needed
                        }
                    }
                    
                    $('#results-container').show(); // show results area
                });
            }
        }

        // create dropdown options for page selection
        function generatePageDropdown(totalItems, maxResultsPerPage) {
            var totalPages = Math.ceil(totalItems / maxResultsPerPage); // calc pages
            totalPages = Math.min(totalPages, maxPages); // cap total pages
            
            var dropdownHTML;
            for (var i = 1; i <= totalPages; i++) {
                dropdownHTML += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>Page ${i}</option>`;
            }

            $('#pageSelect').html(dropdownHTML).show(); // show and add options

            $('#pageSelect').off('change').on('change', function () {
                currentPage = parseInt($(this).val()); // set new page num
                performSearch(); // re-fetch results for new page
            });
        }
    }

    // if on details_m2.html, show book details
    if (window.location.pathname.includes("details_m2.html")) {
        var params = new URLSearchParams(window.location.search);
        var bookId = params.get('id'); // get book id from url

        if (bookId) { // if book id is present
            var detailsURL = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyBQc2lufwPOt41iTkjRlH_Oo2IXpN-n3b8`;

            // get book details
            $.getJSON(detailsURL, function (data) {
                // add book info to details section
                var bookInfoHTML = `
                    <div class="book">
                        <img src="${data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : ''}" alt="${data.volumeInfo.title}">
                        <h3>Title: ${data.volumeInfo.title}</h3>
                        <p><strong>Subtitle:</strong> ${data.volumeInfo.subtitle || 'N/A'}</p>
                        <p><strong>Author(s):</strong> ${data.volumeInfo.authors ? data.volumeInfo.authors.join(', ') : 'N/A'}</p>
                        <h4>Description:</h4>
                        <p>${data.volumeInfo.description || 'No description available.'}</p>
                        <p><strong>Publisher:</strong> ${data.volumeInfo.publisher || 'N/A'}</p>
                        <p><strong>Published Date:</strong> ${data.volumeInfo.publishedDate || 'N/A'}</p>
                        <p><strong>ISBN-10:</strong> ${data.volumeInfo.industryIdentifiers ? data.volumeInfo.industryIdentifiers[0].identifier : 'N/A'}</p>
                        <p><strong>ISBN-13:</strong> ${data.volumeInfo.industryIdentifiers ? data.volumeInfo.industryIdentifiers[1].identifier : 'N/A'}</p>
                        <p><a href="${data.volumeInfo.previewLink}" target="_blank">Preview Book</a></p>
                    </div>
                `;
                $('#bookInfo').html(bookInfoHTML);
            });
        }
    }

    // if on bookshelf_m2.html, show favorite books
    if (window.location.pathname.includes("bookshelf_m2.html")) {
        var bookshelfURL = `https://www.googleapis.com/books/v1/users/104332337407712744214/bookshelves/0/volumes?key=AIzaSyBQc2lufwPOt41iTkjRlH_Oo2IXpN-n3b8`;

        // get favorites from bookshelf
        $.getJSON(bookshelfURL, function (data) {
            var bookshelfHTML = '';

            if (data.items && data.items.length > 0) { // if books found
                data.items.forEach(function (item) { // loop through books
                    $('#favoritesBookshelf').append(`
                        <div class="book-item">
                            <img src="${item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : ''}" alt="${item.volumeInfo.title}">
                            <h3>${item.volumeInfo.title}</h3>
                            <a href="details_m2.html?id=${item.id}" class="book-link">More Info</a>
                        </div>
                    `);
                });
            } else {
                $('#favoritesBookshelf').append('<p>No books in the favorites bookshelf.</p>'); // display message
            }
        });
    }
});
