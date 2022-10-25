import { genHttpRequest } from 'services';

export class CommonRequest {
  static async getCountries() {
    return await genHttpRequest({
      method: 'GET',
      url: '/api/allCountries',
      params: {
      },
    });
  }
  static async getThemeItems(namespace: string, themes: string[]) {
    return await genHttpRequest({
      method: 'POST',
      url: '/api/items',
      data: {
        namespace,
        themes
      },
    });
  }
}
