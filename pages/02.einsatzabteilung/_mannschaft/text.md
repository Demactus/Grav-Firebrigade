---
title: Mannschaft
body_classes: modular
image_align: left
process:
    markdown: true
    twig: true
cache_enable: false
---

## Unsere Mannschaft!


{% set flex = grav.get('flex') %}
{% set directory = flex.directory('vorstellung') %}
{% set vorstellung = directory.collection() %}



{% include 'partials/glight.html.twig' %}

{% for eintrag in vorstellung.filterBy({published: true})%}
{% endfor %}