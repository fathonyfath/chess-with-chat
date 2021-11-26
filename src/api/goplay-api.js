import axios from "axios";

const host = "https://chess-with-chat.uc.r.appspot.com/";

const getEventUrl = (eventSlug) => {
  return new URL(`${eventSlug}`, host);
}

const getGuardUrl = async (eventSlug) => {
  try {
    const url = getEventUrl(eventSlug);
    const response = await axios.request({
      url: url.href,
      method: "GET"
    });
    if (response.data) {
      return response.data;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export { getGuardUrl };