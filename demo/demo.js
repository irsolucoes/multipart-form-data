'use strict';

/* eslint no-console:0 */

import { multipartFormDataFactory } from '../src/multipart-form-data.js';

export async function submitForm(formElement) {
  const multipartSegments = await serializeForm(formElement);

  console.log('serializedContent', multipartSegments.toString());
  console.log('serializedContent bin', multipartSegments.toBinary());

  console.log('AJAXSubmit - The form is now serialized. Submitting...');
  const res = await fetch('/api/multipart', {
    method: 'POST',
    headers: {
      'Content-Type': multipartSegments.getContentType()
    },
    body: multipartSegments.toBinary()
  });

  console.log('AJAXSubmit - Success!', await res.text());
}

async function serializeForm(formElement) {
  const multipartSegments = multipartFormDataFactory();

  for (let nItem = 0; nItem < formElement.elements.length; nItem++) {
    const formField = formElement.elements[nItem];

    if (!formField.hasAttribute('name')) {
      continue;
    }

    const formFieldType =
      formField.nodeName.toUpperCase() === 'INPUT'
        ? formField.getAttribute('type').toUpperCase()
        : 'TEXT';

    switch (formFieldType) {
      case 'RADIO':
      case 'CHECKBOX':
        if (!formField.checked) {
          break;
        }
      case 'TEXT':
        multipartSegments.appendText(formField.name, formField.value);
        break;

      case 'FILE':
        for (const file of formField.files) {
          await multipartSegments.appendFile(
            formField.name,
            file,
            await readFileAsBinary(file)
          );
        }
        break;

      default:
        throw new Error('Invalid field type');
    }
  }

  return multipartSegments;
}

function readFileAsBinary(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.readAsBinaryString(file);
  });
}
