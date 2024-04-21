---
routable: false
process:
    markdown: true
    twig: true
pp_protect: '0'
---

{% set flex = grav.get('flex') %}

{% set directory = flex.directory('einsaetze') %}

{% set einsaetze = directory.collection() %}
{% set einsaetze = einsaetze.sort({date: 'DESC', time: 'DESC'}) %}
<div class="card">
    <div class="card-header fw-card-header">
        <div class="card-title h4"> Letzte Einsätze</div> 
    </div>
    <div class="card-body">
        <div class="container grid-md">
            {% for einsatz in einsaetze.filterBy({published: true}).limit(0, 3) %}
                 <b> {{ einsatz.titel|e }}</b><br>{{ einsatz.date|e }} {{ einsatz.time|e }} Uhr <br>{{ einsatz.ort|e }}<br>
                {% if einsatz.blog %}
                <a href="{{ einsatz.blog|e }}">mehr...</a><br>
                {% endif %}
                <br>
                 {% endfor %}
        </div>
    </div>
</div>


  