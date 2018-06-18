<a href="https://codeclimate.com/repos/5a68a8d1fa63a2027d000069/maintainability"><img src="https://api.codeclimate.com/v1/badges/cddae7b40277d8a357ac/maintainability" /></a>
<a href="https://codeclimate.com/repos/5a68a8d1fa63a2027d000069/test_coverage"><img src="https://api.codeclimate.com/v1/badges/cddae7b40277d8a357ac/test_coverage" /></a>
[![Build Status](https://travis-ci.org/fs-webdev/fs-person.svg?branch=master)](https://travis-ci.org/fs-webdev/fs-person)

# \<fs-person\>

Standard display of a persons sex, name, lifespan, and id for FamilySearch.

![](/../screenshots/person.png?raw=true)

## Installation

```
$ bower install --save fs-webdev/fs-person
```

## Usage

```html
<!-- polymer -->
<fs-person person="[[person]]"></fs-person>

<!-- native -->
<fs-person id="person-el"></fs-person>
<script>
var el = document.getElementById('person-el');
el.person = {
  name: 'John Doe',
  sex: 'male',
  lifespan: '1900–2000',
  id: 'XKCD-123'
};
</script>
```

### Person Object

All properties are optional. Properties not passed in will not be displayed.

* `lang` - [ISO language code](https://www.w3schools.com/tags/ref_language_codes.asp) of the name. Will be used as the `lang` attribute on the name element. This allows screen readers to [properly pronounce the name](https://www.paciellogroup.com/blog/2016/06/using-the-html-lang-attribute/) when it's in a different language the pages.
* `name` - Full name of the person. Defaults to `[Unknown Name]`.
* `givenName` - Given name of the person. Defaults to `[Unknown Name]`.
* `familyName` - Family name of the person.
* `sex` - Sex of the person (lowercase or uppercase). Defaults to `unknown`.
* `lifespan` - Lifespan of the person.
* `id` - Person Id of the person
* `personId` - Alternate property for displaying the person id.
* `nameSystem` -  [eurotypic](http://bdespain.org/S&L/angs/glos/ngs-euro.htm) or [sinotypic](http://bdespain.org/S&L/angs/glos/ngs-sino.htm). Used in `orientation=portrait` to determine how a name should be displayed.
* `portraitUrl` - URL of the image to display as the persons portrait.

The person object can be passed in though the `person` JavaScript property or though the `person` attribute via Polymer or `JSON.stringify`.

```html
<fs-person person='{"name":"John Doe"}'></fs-person>
```

### Attributes

* `person` - The person object to display. Should be passed in via Polymer or `JSON.stringify`.
* `portrait` - Show the persons portrait. Will use `person.portraitUrl` as the src of the image, otherwise will default to displaying a portrait of the sex.
* `theme` - Change the display theme. Values can be `normal` or `nightfall`. Defaults to `normal`.
* `orientation` - Change the display orientation of the person. Values can be `landscape`, `portrait`, or `inline`. Defaults to `landscape`. `orientation=portrait` will automatically turn on the `portrait` attribute.
* `icon-size` - Change the size of the sex icon. Values can be `small` or `medium`. Defaults to `medium`. If the attributes `portrait` or `orientation=inline` are set, this attribute will be ignored and the icon size will be set to `small`.
* `no-sex` - Hide the persons sex.
* `no-lifespan` - Hide the persons lifespan.
* `no-id` - Hide the persons id.
* `relation` - Show two persons as having a relationship by having two `<fs-person>` elements as siblings and adding the `relation` attribute to both. The value of the attribute should be `spouse1` for the first person, and `spouse2` for the second person.

```html
<fs-person person="[[person1]]" relation="spouse1"></fs-person>
<fs-person person="[[person2]]" relation="spouse2"></fs-person>
```

### Properties

* `person` - The person object. Can set this property instead of using the `person` attribute.

### Slots

You can pass a named slot as a child of `<fs-person>` and it will be used to wrap the persons name. This is useful if you need to make the persons name a link or a heading.

```html
<fs-person person="[[person]]">
  <h3 slot="name"></h3>
</fs-person>
```

You can pass a named slot as a child of `<fs-person>` and it will be used to wrap the persons id. This is useful if you need to make the persons id a link or a button.

```html
<fs-person person="[[person]]">
  <a href="#" slot="pid"></a>
</fs-person>
```

You can also pass in an extra details element as a child of `<fs-person>` and it will be displayed beneath the person's displayed information. This is helpful if you need to add an extra line of information, such as if you want to include a link to let the user "view [their] relationship" with the person.

```html
<fs-person>
  <a href="#" slot="extra-details">View My Relationship</a>
</fs-person>
```
