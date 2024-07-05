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


<script type="module">
$(document).delegate('.modal-toggle', 'click', function(e) {
var modal = $(this).attr('data-modal');

    $(modal).addClass('active');

    e.preventDefault();
});

$(document).delegate('.modal-close', 'click', function(e) {
$(this).closest('.modal').removeClass('active');
e.preventDefault();
});
</script>

[owl-carousel items=2 margin=5 center=false loop=true mergefit=true nav=true responsive={0:{items:2},1000:{items:3},1600:{items:4}}]
   {% for eintrag in vorstellung.filterBy({published: true})%}
   <article class="">
      <div class="modal-toggle" data-modal="#{{ eintrag.name|e}}{{ eintrag.vorname|e}}">
         <div class="">
            <h3 class="">
               {{ eintrag.name|e}}, {{ eintrag.vorname|e}}
            </h3>
         </div>
         <img class="" src="user/images/vorstellung-images/{{ eintrag.picked_image }}" style="aspect-ratio: 1/1; object-fit: cover;"/>

      </div>
   </article>
   {% endfor %}
[/owl-carousel]

{% for eintrag in vorstellung.filterBy({published: true})%}
 <div class="modal" id="{{ eintrag.name|e}}{{ eintrag.vorname|e}}">
      <a href="#close" class="modal-overlay modal-close" aria-label="Close"></a>
      <div class="modal-container">
          <div class="modal-header">
            <a href="#close" class="btn btn-clear float-right modal-close" aria-label="Close"></a>
            <div class="modal-title h2">{{ eintrag.vorname|e}}</div>
         </div>
          <div class="modal-body">
            <div class="content">
            <img class="modal-image" src="user/images/vorstellung-images/{{ eintrag.picked_image }}" style="aspect-ratio: 2/3; max-width: 70% "/>
               <h5>
                  <span>
                     <strong>Funktion:</strong>
                     {{ eintrag.funktion|e }}
                  </span>
               </h5>
               <h5>
                  <span>
                     <strong>Beruf:</strong>
                     {{ eintrag.beruf|e }}
                  </span>
               </h5>
               <h5>
                  <span>
                     <strong>Bei der Feuerwehr seit:</strong>
                     {{ eintrag.datum|e }}
                  </span>
               </h5>
               <h5>
                  <span>
                     <strong>Über Mich:</strong>
                     {{ eintrag.beschreibung|e}}
                  </span>
               </h5>
            </div>
         </div>
      </div>
   </div>
{% endfor %}
