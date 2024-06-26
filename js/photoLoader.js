import {isEscapeKey, isElementInFocus} from './util.js';
import { pristine } from './validation.js';
import { resetScaling } from './scale.js';
import { resetEffects } from './effects.js';
import { sendData } from './api.js';
import { showSuccessNotice, showErrorNotice } from './notice.js';
import { FILE_TYPES, ButtonStatus } from './constants.js';

const uploadFile = document.querySelector('#upload-file');
const closeForm = document.querySelector('#upload-cancel');
const form = document.querySelector('.img-upload__form');
const modal = document.querySelector('.img-upload__overlay');
const textHashtags = document.querySelector('.text__hashtags');
const textDescription = document.querySelector('.text__description');
const buttonPublish = document.querySelector('.img-upload__submit');
const imgPreview = document.querySelector('.img-upload__preview > img');
const defaultRadio = document.querySelector('#effect-none');
const effectsPreviews = document.querySelectorAll('.effects__preview');

const renderPreview = () => {
  const file = uploadFile.files[0];
  const fileName = file.name.toLowerCase();
  const matches = FILE_TYPES.some((it) => fileName.endsWith(it));
  if (matches) {
    imgPreview.src = URL.createObjectURL(file);
    effectsPreviews.forEach((preview) => {
      preview.style.backgroundImage = `url('${imgPreview.src}')`;
    });
  }
};

const closeModal = () => {
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
  uploadFile.value = '';
  textHashtags.value = '';
  textDescription.value = '';
  defaultRadio.checked = true;
  pristine.reset();
};

const success = () => {
  closeModal();
  showSuccessNotice();
};

const error = () => {
  showErrorNotice();
};

const blockButton = (status = false) => {
  buttonPublish.disabled = status;
  buttonPublish.textContent = status ? ButtonStatus.SENDING : ButtonStatus.DEFAULT;
};

form.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if(pristine.validate()){
    blockButton(true);
    await sendData(success, error, new FormData(form));
    blockButton();
  }
});

resetScaling();

uploadFile.addEventListener('change', () => {
  renderPreview();
  resetScaling();
  resetEffects();
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);
});

function onDocumentKeydown(evt) {
  if (isEscapeKey(evt) & !isElementInFocus(textHashtags) & !isElementInFocus(textDescription)) {
    evt.preventDefault();
    closeModal();
  }
}

closeForm.addEventListener('click', () => {
  closeModal();
});
