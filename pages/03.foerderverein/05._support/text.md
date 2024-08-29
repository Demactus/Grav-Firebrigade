---
title: Support
body_classes: modular
image_align: left
process:
    markdown: true
    twig: true
cache_enable: false
form:
  action: /foerderverein
  name: my-nice-form
  xhr_submit: true

  fields:
    columns:
      type: columns
      fields:
        column1:
          type: column
          classes: my-column-class
          fields:
            name:
              label: Name
              classes: my-field-class-1
              placeholder: ''
              autocomplete: on
              type: text
              validate:
                required: true

            surname:
              label: Vorname
              placeholder: ''
              type: text
        column2:
          type: column
          classes: my-column-class
          fields:
            street:
              label: Straße
              placeholder: ''
              type: text
            city:
              label: PLZ / Ort
              placeholder: ''
              type: text
            honeypot:
              type: honeypot
              label: Address  
        column3:
          type: column
          classes: my-column-class
          fields:
            email:
              classes: form-control form-control-lg
              label: Email
              placeholder: ''
              type: email
              validate:
                  rule: email
                  required: true
            phone:
              label: Telefon
              placeholder: ''
              type: tel
        column4:
          type: column
          classes: my-column-class
          fields:
            birthdate:
              label: Geburtstag
              type: date
        column5:
          type: column
          classes: my-column-class
          fields:
            date:
              label: Datum
              type: date
            signature:
              label: Vollständiger Name
              type: text
        column6:
          type: column
          classes: my-column-class
          fields:
            terms:
              type: checkbox
              label: "Hiermit akzpetiere ich die <a href='https://dev.ff-inheiden.de/impressum/'>Datenschutzvereinbarung</a>"
            
        column7:
          type: column
          classes: display-column-class
          fields:
            content:
              type: section
              markdown: true
              title: 'Einzugsermächtigung'
              underline: true
        column8:
          type: column
          fields:
            bankInfo:
              type: display
              size: large
              markdown: true
              label: " "
              content: "Gläubiger-Identifikationsnummer DE09ZZZ00000047531\n\n Mandatsreferenz WIRD SEPARAT MITGETEILT \n\n **SEPA-Lastschriftmandat**\n\n Ich / Wir ermächtige/n den Verein der Freiwilligen Feuerwehr Hungen-Inheiden e.V., Zahlungen von meinem / unserem Konto mittels Lastschrift einzuziehen. Zugleich weise/n ich / wir mein / unser Kreditinstitut an, die vom Verein der Freiwilligen Feuerwehr Hungen-Inheiden e.V. auf mein / unser Konto gezogenen Lastschriften einzulösen. Hinweis: Ich kann / Wir können innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. Es gelten dabei die mit meinem / unserem Kreditinstitut vereinbarten Bedingungen"
        column9:
          type: column
          fields:
            nameBank:
              type: text
              label: Name, Vorname (Kontoinhaber)
              validate:
                required: true
        column10:
          type: column
          fields:
            streetBank:
              type: text
              label: Straße und Hausnummer
            cityBank:
              type: text
              label: Postleitzahl und Ort
        column11:
          type: column
          fields:
            bank:
              type: text
              label: Kreditinstitut (Kontoinhaber)
            bic:
              type: text
              label: Kreditinstitut (BIC)
        column12:
          type: column
          fields:
            iban:
              type: text
              label: IBAN
              placeholder:  DE 12 3456 1234 4567 7890 00
            honeypot:
              type: honeypot
              label: Wallet Address
        column13:
          type: column
          fields:
            basic-captcha:
              type: basic-captcha
              placeholder: übertrage die 6 Zeichen hier
              label: Leider müssen wir zur Sicherheit eine kleine Überprüfung machen
  buttons:
    - type: submit
      classes: btn btn-primary
      value: Submit
  process:
    basic_captcha: 
        message: 'Captcha Überprüfung fehlgeschlagen'
    message: 'Danke für deinen Antrag!'
    email:
      subject: "[Site Contact Form] {{ form.value.name|e }}"
      body: "{% include 'forms/data.html.twig' %}"
    display: thankyou
pp_protect: '0'
---

## Sie wollen uns unterstützen?

Sie wollen die Feuerwehr in Ihrem Ort unterstützen ohne selbst aktiv in der Einsatzabteilung tätig zu werden?

Ganz einfach – werden Sie Mitglied im Feuerwehrverein. Mit 12 Euro pro Jahr unterstützen Sie wirkungsvoll unsere
Arbeit.  


<div class="accordion form-accordion">
  <input type="checkbox" id="accordion-1" name="accordion-checkbox" hidden>
  <label class="accordion-header" for="accordion-1">
   <i class="fa-solid fa-circle-arrow-right fa-2x mr-1"></i> <strong>Beitrittserklärung online ausfüllen</strong>
  </label>
  <div class="accordion-body">
        <h2>Beitrittserklärung  </h2>
        <span>Ich erkläre hiermit meinen Beitritt als förderndes Mitglied zum Verein der Freiwilligen Feuerwehr Hungen-Inheiden e.V. . Mit meinem Jahresbeitrag in Höhe von 12,-Euro unterstütze ich den Verein entsprechend seiner satzungsgemäßen Aufgaben.</span>
    
    <h4>Persönliche Angaben</h4>
    {% include "forms/form.html.twig" with { form: forms('my-nice-form') } %}
    
  </div>

</div>
 
<script>
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', function () {
        const body = this.nextElementSibling;
        body.classList.toggle('open');

        const icon = this.querySelector('i');
        icon.classList.toggle('rotate');
      });
    });
  </script>
