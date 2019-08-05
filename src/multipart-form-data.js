'use strict';

const LB = '\r\n';

export function multipartFormDataFactory() {
  const sBoundary = `---------------------------${Date.now().toString(16)}`;
  const segments = [];
  const textEncoder = new TextEncoder();

  return {
    appendText(name, value) {
      segments.push({
        type: 'text',
        content: `Content-Disposition: form-data; name="${name}"${LB}${LB}${value}${LB}`
      });
    },
    appendFile(name, file, binaryContent) {
      segments.push({
        type: 'file',
        content: `Content-Disposition: form-data; name="${name}"; filename="${
          file.name
        }"${LB}Content-Type: ${file.type}${LB}${LB}${binaryContent}${LB}`
      });
    },
    getContentType() {
      return `multipart/form-data; boundary=${sBoundary}`;
    },
    toString() {
      return segments.map(({ content }) => content).join('');
    },
    toBinary() {
      const ui8DataArray = [];

      ui8DataArray.push(str2Uint8(`--${sBoundary}${LB}`));

      segments.forEach(({ type, content }, index) => {
        const isLast = index === segments.length - 1;

        let contentToEncode = `${content}${
          isLast ? '' : `--${sBoundary}${LB}`
        }`;

        if (type === 'text') {
          ui8DataArray.push(textEncoder.encode(contentToEncode));
        } else {
          ui8DataArray.push(str2Uint8(contentToEncode));
        }
      });

      ui8DataArray.push(str2Uint8(`--${sBoundary}--${LB}`));

      const finalUi8DataLength = ui8DataArray.reduce(
        (total, ui8Data) => total + ui8Data.length,
        0
      );
      let finalUi8DataIndex = 0;
      const finalUi8Data = new Uint8Array(finalUi8DataLength);

      ui8DataArray.forEach((ui8Data) => {
        for (let i = 0; i < ui8Data.length; i += 1, finalUi8DataIndex += 1) {
          finalUi8Data[finalUi8DataIndex] = ui8Data[i];
        }
      });

      return finalUi8Data;
    }
  };
}

function str2Uint8(str) {
  const ui8Data = new Uint8Array(str.length);

  for (let i = 0; i < str.length; i += 1) {
    ui8Data[i] = str.charCodeAt(i) & 0xff;
  }

  return ui8Data;
}
