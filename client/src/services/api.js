import axios from 'axios';

const SERVER = `${window.location.protocol}//${window.location.hostname}:3001`;

export function fetchDisplays() {
  return axios.get(`${SERVER}/api/displays`);
}

export function createDisplay(name, mode) {
  return axios.post(`${SERVER}/api/displays`, { name, mode, template: {} });
}

export function deleteDisplay(display_number) {
  return axios.delete(`${SERVER}/api/displays/${display_number}`);
}

export function patchDisplay(display_number, data) {
  return axios.patch(`${SERVER}/api/displays/${display_number}`, data);
}
