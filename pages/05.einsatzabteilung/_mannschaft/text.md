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

[owl-carousel items=2 margin=5 center=false loop=true mergefit=true nav=true responsive={0:{items:1},1000:{items:2},1600:{items:3}}]
   {% for eintrag in vorstellung.filterBy({published: true})%}
   <article class="">
      <div class="">
         <div class="">
            <h3 class="">
               {{ eintrag.name|e}}, {{ eintrag.vorname|e}}
            </h3>
         </div>
         <img class="" src="user/images/vorstellung-images/{{ eintrag.picked_image }}" style="aspect-ratio: 3/2;"/>
         <div class="">Funktion: {{ eintrag.funktion|e }}</div>
         <div class="">
            <div class="">{{ eintrag.beschreibung | replace({"\n":"<br>"}) | raw }} </div>
         </div>
      </div>
   </article>
   {% endfor %}
[/owl-carousel]