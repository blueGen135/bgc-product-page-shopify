$(window).on("load", function () {
  function isNumber(evt) {
    evt = evt ? evt : window.event;
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  function getVariantFromOptions() {
    let variantArr = [];
    jQuery(".product-category .mgfox").map(function (i, el) {
      var type = jQuery(this).attr("type");
      if (type === "radio" || type === "checkbox") {
        if ($(el).is(":checked")) {
          variantArr.push({
            value: $(el).val(),
            index: $(el).attr("data-index"),
          });
        }
      } else {
        variant = { value: $(el).val(), index: $(el).data("index") };
        variantArr.push(variant);
      }
    });
    return variantArr;
  }

  function getVariantFromSwatches() {
    let variantArr = [];
    $(".product-category input[type=radio]").map(function (i, el) {
      if ($(el).is(":checked")) {
        variantArr.push({
          value: $(el).val(),
          index: $(el).attr("data-index"),
        });
      }
    });
    return variantArr;
  }

  function updateHistoryState(variant) {
    if (!history.replaceState || !variant) {
      return;
    }

    var newurl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?variant=" +
      variant.id;

    window.history.replaceState({ path: newurl }, "", newurl);
  }

  /**Money Format */
  theme.Currency = (function () {
    var moneyFormat = "${{amount}}"; // eslint-disable-line camelcase

    function formatMoney(cents, format) {
      if (typeof cents === "string") {
        cents = cents.replace(".", "");
      }
      var value = "";
      var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      var formatString = format || moneyFormat;

      function formatWithDelimiters(number, precision, thousands, decimal) {
        thousands = thousands || ",";
        decimal = decimal || ".";

        if (isNaN(number) || number === null) {
          return 0;
        }

        number = (number / 100.0).toFixed(precision);

        var parts = number.split(".");
        var dollarsAmount = parts[0].replace(
          /(\d)(?=(\d\d\d)+(?!\d))/g,
          "$1" + thousands
        );
        var centsAmount = parts[1] ? decimal + parts[1] : "";

        return dollarsAmount + centsAmount;
      }

      switch (formatString.match(placeholderRegex)[1]) {
        case "amount":
          value = formatWithDelimiters(cents, 2);
          break;
        case "amount_no_decimals":
          value = formatWithDelimiters(cents, 0);
          break;
        case "amount_with_comma_separator":
          value = formatWithDelimiters(cents, 2, ".", ",");
          break;
        case "amount_no_decimals_with_comma_separator":
          value = formatWithDelimiters(cents, 0, ".", ",");
          break;
        case "amount_no_decimals_with_space_separator":
          value = formatWithDelimiters(cents, 0, " ");
          break;
        case "amount_with_apostrophe_separator":
          value = formatWithDelimiters(cents, 2, "'");
          break;
      }

      return formatString.replace(placeholderRegex, value);
    }

    return {
      formatMoney: formatMoney,
    };
  })();

  $(".add").on("click", function () {
    $(this)
      .prev()
      .val(+$(this).prev().val() + 1);
  });

  $(".sub").on("click", function () {
    if ($(this).next().val() > 1) {
      if ($(this).next().val() > 1)
        $(this)
          .next()
          .val(+$(this).next().val() - 1);
    }
  });

  function update_varient_id(variant) {
    $("#variant_id").val(variant);
  }

  function update_slider_image(variantImg) {
    var slideIndex = $("#" + variantImg).attr("data-index");
    $(".product-slider").slick("slickGoTo", slideIndex - 1);
  }

  function get_sku(variant) {
    var skuCode = variant.sku;

    if (skuCode != "") {
      $("#product_sku").html(
        "<span><strong>SKU: </strong>" + skuCode + "</span>"
      );
    }
  }

  function update_add_to_cart_text(variant) {
    if (variant.available == false) {
      $("#addToCart").attr("disabled", true);
      $("#addToCart").text("Sold Out");
    } else {
      $("#addToCart").attr("disabled", false);
      $("#addToCart").text("Add to Cart");
    }
  }

  function update_product_price(variant) {
    var currency = theme.moneyFormat.substring(0, 1);
    var regular_price = variant.price;
    var compare_price = variant.compare_at_price;
    var regular_price_output =
      '<span class="money regular_price" id="regular_price">' +
      theme.Currency.formatMoney(regular_price, theme.moneyFormat) +
      "</span>";

    if (compare_price > regular_price) {
      var compare_price_output =
        '<span class="money compare_price" id="compare_price"> ' +
        theme.Currency.formatMoney(compare_price, theme.moneyFormat) +
        "</span>";
      var saved_price = Math.round(compare_price - regular_price);
      var saved_price_output =
        '<span class="save_amount" id="save_amount"> Save up to ' +
        theme.Currency.formatMoney(saved_price, theme.moneyFormat) +
        "</span>";
      output = regular_price_output + compare_price_output + saved_price_output;
    } else {
      var compare_price_output = "";
      var saved_price = "";
      var saved_price_output = "";
      output = regular_price_output + compare_price_output + saved_price_output;
    }

    $("#product_price").html(output);
    console.log(variant);
  }

  function updateMasterVariant(variant) {
    var masterSelect = jQuery(".product-form__variants");
    masterSelect.val(variant.id);
  }

  jQuery(".product-category .mgfox").on("change", function () {
    var selectedValues = getVariantFromOptions();
    var variants = window.product.variants;
    var found = false;
    variants.forEach(function (variant) {
      var satisfied = true;
      var options = variant.options;
      selectedValues.forEach(function (option) {
        if (satisfied) {
          satisfied = option.value === variant[option.index];
        }
      });

      if (satisfied) {
        found = variant;
      }
    });
    console.log(selectedValues);
    update_add_to_cart_text(found);
    get_sku(found);
    update_varient_id(found.id);
    // update_slider_image(found.featured_image.id);
    update_product_price(found);
    updateMasterVariant(found);
    updateHistoryState(found);
  });

  // jQuery("input[type=radio]").on("change", function () {
  //   var selectedValues = getVariantFromSwatches();
  //   var variants = window.product.variants;
  //   var found = false;
  //   variants.forEach(function (variant) {
  //     var satisfied = true;
  //     var options = variant.options;
  //     selectedValues.forEach(function (option) {
  //       if (satisfied) {
  //         satisfied = option.value === variant[option.index];
  //       }
  //     });

  //     if (satisfied) {
  //       found = variant;
  //     }
  //   });
  //   console.log(found.id);
  //   update_add_to_cart_text(found);
  //   get_sku(found);
  //   update_varient_id(found.id);
  //   // update_slider_image(found.featured_image.id);
  //   update_product_price(found);
  //   updateMasterVariant(found);
  // });

  $(".product-slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    cssEase: "linear",
    asNavFor: ".product-slider-nav",
  });
  $(".product-slider-nav").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: ".product-slider",
    dots: false,
    centerMode: true,
    focusOnSelect: true,
    prevArrow:
      "<button type='button' class='slick-prev p-slider-btn' id='pro_previous'><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-left'><polyline points='15 18 9 12 15 6'/></svg></button>",
    nextArrow:
      "<button type='button' class='slick-next p-slider-btn' id='pro_next'><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-right'><polyline points='9 18 15 12 9 6'/></svg></button>",
  });
  $(".metal_info").on("hover", function () {
    let vl = $(this).attr("alt");
    $("#metal_name").text(vl);
  });
});
