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






<div class="card side-card" xmlns="http://www.w3.org/1999/html">
    <div class="card-header fw-card-header">
        <div class="card-title h4"><strong>Letzte Einsätze</strong></div> 
    </div>
    <div class="card-body side-card-body">
        <div class="container grid-md">
            {% for einsatz in einsaetze.filterBy({published: true}).limit(0, 5) %}
                <b> 
                    {% if einsatz.blog %}
                        <a href="{{ einsatz.blog|e }}">{{ einsatz.titel|e }}</a>
                    {% elseif (einsatz.kurzbeschreibung) and (einsatz.kurzbeschreibung_freigegeben == true) and (einsatz.picked_image) %}
                        [modal name="Kurzinfo-{{loop.index}}"]
                            <div class="details-modal-title">
                                <h1>{{ einsatz.titel|e }}</h1>
                                <span> <i class="fa-regular fa-clock"></i> {{ einsatz.date|date('d') }}. {{ 'GRAV.MONTHS_OF_THE_YEAR'|ta(einsatz.date|date('n') - 1)}} {{einsatz.date|date('Y') }} | {{ einsatz.time|e }} Uhr <br>
                                        <i class="fa-solid fa-location-dot"></i> {{ einsatz.ort }}
                                </span>                            
                            </div>
                            <div class="details-modal-content">
                                <img class="modal-image" src="user/images/einsatz-images/{{ einsatz.picked_image }}" />
                                <p>{{ einsatz.kurzbeschreibung|e }}</p>
                            </div>
                        [/modal][modal-launch modal="Kurzinfo-{{loop.index}}"]<i class="fa fa-info-circle"></i> <i class="fa fa-camera"></i> {{ einsatz.titel|e }}[/modal-launch]
                    {% elseif (einsatz.kurzbeschreibung) and (einsatz.kurzbeschreibung_freigegeben == true) and (einsatz.picked_image == false) %}
                        [modal name="Kurzinfo-{{loop.index}}"]
                            <div class="details-modal-title">
                                <h1>{{ einsatz.titel|e }}</h1>
                                <span> <i class="fa-regular fa-clock"></i> {{ einsatz.date|date('d') }}. {{ 'GRAV.MONTHS_OF_THE_YEAR'|ta(einsatz.date|date('n') - 1)}} {{einsatz.date|date('Y') }} | {{ einsatz.time|e }} Uhr <br>
                                        <i class="fa-solid fa-location-dot"></i> {{ einsatz.ort }}
                                </span>
                            </div>
                            <div class="details-modal-content">
                                <p>{{ einsatz.kurzbeschreibung|e }}</p>
                            </div>
                        [/modal][modal-launch modal="Kurzinfo-{{loop.index}}"]<i class="fa fa-info-circle"></i> {{ einsatz.titel|e }} [/modal-launch]
                    {% else %}
                        {{ einsatz.titel|e }} 
                    {% endif %}
                </b>
                <br>
                {{ einsatz.date|date('d') }}. {{ 'GRAV.MONTHS_OF_THE_YEAR'|ta(einsatz.date|date('n') - 1)}} {{einsatz.date|date('Y') }} | {{ einsatz.time|e }} Uhr 
                <br>
                {{ einsatz.ort|e }}
                <br>
                {% if (einsatz.kurzbeschreibung) and (einsatz.kurzbeschreibung_freigegeben == true) and (einsatz.picked_image) %}
                {% elseif (einsatz.kurzbeschreibung) and (einsatz.kurzbeschreibung_freigegeben == true) and (einsatz.picked_image == false) %}
                {% endif %}
            
                <br>
                 {% endfor %}
        </div>
    </div>
</div>


 
