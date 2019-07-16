'use strict';

const LB = '\r\n';

export function multipartFormDataFactory() {
  const sBoundary = `---------------------------${Date.now().toString(16)}`;
  const segments = [];

  return {
    appendText(name, value) {
      segments.push(
        `Content-Disposition: form-data; name="${name}"${LB}${LB}${value}${LB}`
      );
    },
    appendFile(name, file, binaryContent) {
      segments.push(
        `Content-Disposition: form-data; name="${name}"; filename="${
          file.name
        }"${LB}Content-Type: ${file.type}${LB}${LB}${binaryContent}${LB}`
      );
    },
    getContentType() {
      return `multipart/form-data; boundary=${sBoundary}`;
    },
    toString() {
      return segments.join('');
    },
    toBinary() {
      const dataToSend = `--${sBoundary}${LB}${segments.join(
        `--${sBoundary}${LB}`
      )}--${sBoundary}--${LB}`;

      const nBytes = dataToSend.length,
        ui8Data = new Uint8Array(nBytes);

      for (let nIdx = 0; nIdx < nBytes; nIdx++) {
        ui8Data[nIdx] = dataToSend.charCodeAt(nIdx) & 0xff;
      }

      return ui8Data;
    }
  };
}
