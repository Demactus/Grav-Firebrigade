---
title: Application Form


application-form:
        action: '/03.foerderverein'
        inline_errors: true
        fields:
            test:
            type: display
            size: large
            label: Instructions
            markdown: true
            content: "This is a test of **bold** and _italic_ in a text/display field\n\nanother paragraph...."

            applicant.surname:
                label: Name
                type: text
                autofocus: true
                validate:
                    required: true
            applicant.name:
                label: Vorname
                type: text
                autofocus: true
                validate:
                    required: true
            applicant.email:
                type: email
                size: large
                autofocus: true
                label: Email
                placeholder: Enter your email address
                validate:
                    rule: email
                    required: true
            applicant.phone:
                type: tel
                label: 'Your Phone Number'
        buttons:
            submit:
                type: submit
                value: Senden
            reset:
                type: reset
                value: Zurücksetzen
        process:
            email:
                from: "{{ config.plugins.email.from }}"
                to:
                    - "{{ config.plugins.email.to }}"
                    - "{{ form.value.email }}"
                subject: "[Feedback] {{ form.value.name|e }}"
                body: "{% include 'forms/data.html.twig' %}"
            save:
                fileprefix: feedback-
                dateformat: Ymd-His-u
                extension: txt
                body: "{% include 'forms/data.txt.twig' %}"
            message: Thank you for your feedback!
            display: '/03.foerderverein'
---

### Beitrittsform