import fetch from "isomorphic-fetch";
import request from "request";
import {
  SET_COMPANY_NAME,
  SET_TAGLINE_TEXT,
  SET_INDUSTRY_NAME,
  SET_COMPANY_DESCRIPTION,
  SELECT_LOGO_INSPIRATION,
  SELECT_COLOR_PALETTE,
  REQUEST_ICONS,
  RECEIVE_ICONS,
  REQUEST_LOGOS,
  RECEIVE_LOGOS,
  REQUEST_MORE_LOGOS,
  RECEIVED_MORE_LOGOS,
  SELECT_LOGO,
  MAKE_REQUEST,
  REQUEST_SUCCESS,
} from "./actionTypes";

const config = require("../config/config.json"); // TODO use import statement here. Need to modify webpack config.

export const setCompanyName = (name) => {
  return { type: SET_COMPANY_NAME, name };
};

export const setTaglineText = (tagline) => {
  return { type: SET_TAGLINE_TEXT, tagline };
};

export const setIndustryName = (industry) => {
  return { type: SET_INDUSTRY_NAME, industry };
};

export const setCompanyDescription = (description) => {
  return { type: SET_COMPANY_DESCRIPTION, description };
};

export const selectLogoInspiration = (inspiration) => {
  return { type: SELECT_LOGO_INSPIRATION, inspiration };
};

export const selectColorPalette = (name) => {
  return { type: SELECT_COLOR_PALETTE, name };
};

export const requestIconsByTerm = (term) => {
  return { type: REQUEST_ICONS, term };
};

export const receiveIcons = (icons) => {
  return { type: RECEIVE_ICONS, icons };
};

export const requestLogos = (chars) => {
  return { type: REQUEST_LOGOS, chars };
};

export const receiveLogos = (concepts) => {
  return { type: RECEIVE_LOGOS, concepts };
};

export const requestMoreLogos = (chars) => {
  return { type: REQUEST_MORE_LOGOS, chars };
};

export const receivedMoreLogos = (concepts) => {
  return { type: RECEIVED_MORE_LOGOS, concepts };
};

export const selectLogo = (logo) => {
  return { type: SELECT_LOGO, logo };
};

export const makeRequest = () => {
  return { type: MAKE_REQUEST };
};

export const requestSuccess = () => {
  return { type: REQUEST_SUCCESS };
};

export const setNewSession = () => {
  return (dispatch) => {
    const URL = config.URLS.local + "/api/user/new-session";

    const generateLogoRequest = {
      url: URL,
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    return new Promise((fulfill, reject) => {
      request(generateLogoRequest, (err, body, res) => {
        res = JSON.parse(res);
        if (res.statusCode === 200) {
          localStorage.setItem('session', res['sessionId']);
          fulfill();
        } else {
          reject();
        }
      });
    });
  };
};

export function postSurveyRequest(survey) {
  return (dispatch) => {
    dispatch(makeRequest());
    const session = localStorage.getItem('session');
    const URL = config.URLS.local + "/api/survey";

    const surveyRequest = {
      url: URL,
      method: "POST",
      body: JSON.stringify(survey),
      headers: { "Content-Type": "application/json", 'Set-Cookie': `LOGO_MAKER_SESSION=${session}` }
    };

    return new Promise((fulfill, reject) => {
      request(surveyRequest, (err, body, res) => {
        res = JSON.parse(res);
        if (res.statusCode === 200) {
          dispatch(requestSuccess());
          fulfill(body);
        } else {
          reject(res);
        }
      });
    });
  };
}

export function fetchIcons(term) {
  return (dispatch) => {
    dispatch(requestIconsByTerm(term));

    return fetch(
      `https://fathomless-harbor-10088.herokuapp.com/api/icons/${term}`
    ).then((response) => response.json());
  };
}

export function fetchLogos(chars) {
  return (dispatch) => {
    if (!chars) {
      chars = JSON.parse(localStorage.getItem('chars'))
    } else {
      localStorage.setItem('chars', JSON.stringify(chars))
    }
    dispatch(requestLogos(chars));

    const URL = config.URLS.local + "/api/logo/chars";
    const session = localStorage.getItem('session');

    const generateLogoRequest = {
      url: URL,
      method: "POST",
      body: JSON.stringify(chars),
      headers: { "Content-Type": "application/json", 'Set-Cookie': `LOGO_MAKER_SESSION=${session}` }
    };
    
    return new Promise((fulfill, reject) => {
      request(generateLogoRequest, (err, body, res) => {
        res = JSON.parse(res);
        if (res.statusCode === 200) {
          dispatch(receiveLogos(res.concepts));
          fulfill(body);
        } else {
          reject(res);
        }
      });
    });
  };
}

export function fetchMoreLogos(chars) {
  return (dispatch) => {
    dispatch(requestMoreLogos(chars));
    const URL = config.URLS.local + "/api/logo/concepts";
    const session = localStorage.getItem('session');

    const generateLogoRequest = {
      url: URL,
      method: "POST",
      body: JSON.stringify(chars),
      headers: { "Content-Type": "application/json", 'Set-Cookie': `LOGO_MAKER_SESSION=${session}` }
    };

    return new Promise((fulfill, reject) => {
      request(generateLogoRequest, (err, body, res) => {
        res = JSON.parse(res);
        if (res.statusCode === 200) {
          dispatch(receivedMoreLogos(res.concepts));
          fulfill(body);
          // Scroll down to see newly generated logos
          window.scrollBy(0, 530);
        } else {
          reject(res);
        }
      });
    });
  };
}

export function downloadLogo(logo) {
  return (dispatch) => {
    const URL = config.URLS.local + "/api/logo/download";
    const session = localStorage.getItem('session');

    const data = {
      logo: logo,
    };

    const downloadRequest = {
      url: URL,
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json", responseType: 'blob', 'Set-Cookie': `LOGO_MAKER_SESSION=${session}` },
    };

    console.log("downloadRequest", downloadRequest);
    request(downloadRequest, async (err, body, res) => {
      // window.open(URL, 'blank');
      if (err) return;

      const { blob } = JSON.parse(res);
      // let url = window.URL.createObjectURL(blob);
      blob.filter(x => {
        let link = document.createElement('a');
        link.href = 'data:application/zip;base64,' + x.data;
        link.download = x.label;
        link.click();
        link.remove();
      })
    });
  };
}
