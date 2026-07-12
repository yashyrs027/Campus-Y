import techfest from "./assets/events/techfest.jpg";
import seminar from "./assets/events/seminar.jpg";
import aiWorkshop from "./assets/events/ai-workshop.jpg";


export const eventImages = {
    techfest: techfest,
    "Expert lecture": seminar,
    "AI Workshop": aiWorkshop,
};

export const getEventImage = (title) =>
    eventImages[title];