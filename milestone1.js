$(document).ready(function () {
    $.getJSON('json_m1/google-books-book.json', function (data) {
        var title = data.volumeInfo.title;
        var subtitle = data.volumeInfo.subtitle;
        var authors = data.volumeInfo.authors.join(', ');
        var description = data.volumeInfo.description;
        var publishedDate = data.volumeInfo.publishedDate;
        var isbn10 = data.volumeInfo.industryIdentifiers[0].identifier;
        var isbn13 = data.volumeInfo.industryIdentifiers[1].identifier;
        var pageCount = data.volumeInfo.pageCount;
        var categories = data.volumeInfo.categories.join(', ');
        var averageRating = data.volumeInfo.averageRating;
        var thumbnail = data.volumeInfo.imageLinks.thumbnail;
        var previewLink = data.volumeInfo.previewLink;

        $('#googleBooksData').append(`
            <div class="book">
                <img src="${thumbnail}" alt="${title}">
                <h3>Title: ${title}</h3>&nbsp;
                <h4>Subtitle: ${subtitle}</h4>&nbsp;
                <p><strong>Author(s):</strong> ${authors}</p> &nbsp;
                <h4>Description:</h4> 
                <p>${description}</p> &nbsp;
                <p><strong>Published:</strong> ${publishedDate}</p>
                <p><strong>ISBN-10:</strong> ${isbn10}</p>
                <p><strong>ISBN-13:</strong> ${isbn13}</p>
                <p><strong>Page Count:</strong> ${pageCount}</p>
                <p><strong>Categories:</strong> ${categories}</p>
                <p><strong>Average Rating:</strong> ${averageRating}</p> &nbsp;
                <p><a href="${previewLink}" class="bookPreviewLink">Preview Book</a></p>
                &nbsp;
            </div>
        `);
    });

    $.getJSON('json_m1/google-books-search.json', function (booksData) {
        booksData.items.forEach(function(book) {
            var title = book.volumeInfo.title;
            var authors = book.volumeInfo.authors.join(', ');
            var description = book.volumeInfo.description;
            var thumbnail = book.volumeInfo.imageLinks.thumbnail;
            var previewLink = book.volumeInfo.previewLink;

            $('#bookList').append(`
                <div class="bookItem">
                    <img src="${thumbnail}" alt="${title}">
                    <h3>${title}</h3>
                    <p><strong>Author(s): </strong>${authors}</p>
                    &nbsp;
                    <p><strong>Description:</strong> ${description}</p>
                    &nbsp;
                    <p><a href="${previewLink}" class="bookPreviewLink">Preview Book</a></p>
                    &nbsp;
                </div>
            `);
        });
    });
});
