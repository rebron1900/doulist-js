function search(e) {
    if (e.target.dataset.value == "book") {
        document
            .querySelectorAll(".fyear .dvtjjf")
            .forEach((item) => item.classList.add("hide"));
        document.querySelector(".genres").classList.add("hide");
        document
            .querySelectorAll(".dfdORB[data-type=book]")
            .forEach(function (item) {
                document
                    .querySelectorAll(
                        '.fyear .dvtjjf[data-value="' + item.dataset.year + '"]'
                    )
                    .forEach((item) => item.classList.remove("hide"));
            });
        document
            .querySelectorAll(`.sc-gtsrHT`)
            .forEach((item) => item.classList.remove("active"));
        e.target.classList.add("active");
    } else if (e.target.dataset.value == "movie") {
        document
            .querySelectorAll(".fyear .dvtjjf")
            .forEach((item) => item.classList.add("hide"));
        document.querySelector(".genres").classList.remove("hide");
        document
            .querySelectorAll(".dfdORB[data-type=movie]")
            .forEach(function (item) {
                document
                    .querySelectorAll(
                        '.fyear .dvtjjf[data-value="' + item.dataset.year + '"]'
                    )
                    .forEach((item) => item.classList.remove("hide"));
            });
        document
            .querySelectorAll(`.sc-gtsrHT`)
            .forEach((item) => item.classList.remove("active"));
        e.target.classList.add("active");
    } else if (e.target.classList.contains("kEoOHR")) {
        document.querySelector(".genres").classList.remove("hide");
        document
            .querySelectorAll(`.sc-gtsrHT`)
            .forEach((item) => item.classList.remove("hide"));
        document
            .querySelectorAll(".dfdORB")
            .forEach((item) => item.classList.remove("hide"));
        document
            .querySelectorAll(`.sc-gtsrHT`)
            .forEach((item) => item.classList.remove("active"));
    }

    document
        .querySelectorAll(".dfdORB")
        .forEach((item) => item.classList.add("hide"));
    document
        .querySelector(`.dvtjjf.active[data-search="${e.target.dataset.search}"]`)
        ?.classList.remove("active");
    if (e.target.dataset.value) {
        e.target.classList.add("active");
    }
    const searchItems = document.querySelectorAll(".dvtjjf.active");
    const attributes = Array.from(searchItems, (searchItem) => {
        const property = `data-${searchItem.dataset.search}`;
        const logic = searchItem.dataset.method === "contain" ? "*" : "^";
        const value =
            searchItem.dataset.method === "contain"
                ? `${searchItem.dataset.value}`
                : searchItem.dataset.value;
        return `[${property}${logic}='${value}']`;
    });
    const selector = `.dfdORB${attributes.join("")}`;
    document
        .querySelectorAll(selector)
        .forEach((item) => item.classList.remove("hide"));
}
function sort(e) {
    const sortBy = e.target.dataset.order;
    const style = document.createElement("style");
    style.classList.add("sort-order-style");
    document.querySelector("style.sort-order-style")?.remove();
    document.querySelector(".sort-by-item.active")?.classList.remove("active");
    e.target.classList.add("active");
    if (sortBy === "rating") {
        const movies = Array.from(document.querySelectorAll(".dfdORB"));
        movies.sort((movieA, movieB) => {
            const ratingA = parseFloat(movieA.dataset.rating) || 0;
            const ratingB = parseFloat(movieB.dataset.rating) || 0;
            if (ratingA === ratingB) {
                return 0;
            }
            return ratingA > ratingB ? -1 : 1;
        });
        const stylesheet = movies
            .map(
                (movie, idx) =>
                    `.dfdORB[data-rating="${movie.dataset.rating}"] { order: ${idx}; }`
            )
            .join("\r\n");
        style.innerHTML = stylesheet;
        document.body.appendChild(style);
    }
}

window.addEventListener("click", function (e) {
    if (e.target.classList.contains("sc-gtsrHT")) {
        e.preventDefault();
        search(e);
    }
});

window.addEventListener("click", function (e) {
    if (e.target.classList.contains("sort-by-item")) {
        e.preventDefault();
        sort(e);
    }
});

$(document).ready(function () {
    var temp = { douban: [], books: [] };
    $.when(
        $.getJSON("{{ @custom.douban_book }}"),
        $.getJSON("{{ @custom.douban_movie }}")
    ).done(function (b, m) {
        // 或者也可以使用 ".done"
        $(m[0]).each(function (i, v) {
            temp.douban.push({
                id: this.id,
                title: this.subject.title,
                subtitle: this.subject.card_subtitle,
                poster: this.subject.pic.large,
                pubdate: this.subject.pubdate[0],
                url: this.subject.url,
                rating: this.subject.rating.value,
                genres: this.subject.genres.join(","),
                star: this.subject.rating.star_count,
                comment: this.comment,
                tags: this.tags.join(","),
                star_time: this.create_time,
                type: "movie",
            });
        });
        $(b[0]).each(function () {
            temp.douban.push({
                id: this.id,
                title: this.subject.title,
                subtitle: this.subject.card_subtitle,
                poster: this.subject.pic.large,
                pubdate: this.subject.pubdate[0],
                url: this.subject.url,
                rating: this.subject.rating == null ? 0 : this.subject.rating.value,
                genres: "",
                star: this.subject.rating == null ? 0 : this.subject.rating.star_count,
                comment: this.comment,
                tags: "",
                star_time: this.create_time,
                type: "book",
            });
        });

        $(".movies").html(tmpl("tmpl-movies", temp));

        var gtemp = [];
        var gyear = [];
        $(temp.douban).each(function () {
            t = this.genres.split(",");
            if (t.length > 0) {
                $(t).each(function (i, d) {
                    if (gtemp.indexOf(d) == -1) {
                        gtemp.push(d);
                    }
                });
            } else {
                gtemp.push(this.genres);
            }

            this.pubdate =
                typeof this.pubdate == "undefined"
                    ? ""
                    : this.pubdate.replace("年", "-").replace("月", "-");
            var tyear = new Date(this.pubdate).getFullYear();
            if (gyear.indexOf(tyear) == -1) {
                gyear.push(tyear);
            }
        });
        $(".genres").html(tmpl("tmpl-genres", gtemp));
        $(".fyear").html(
            tmpl(
                "tmpl-fyear",
                gyear.sort(function (a, b) {
                    return b - a;
                })
            )
        );
    });
});
