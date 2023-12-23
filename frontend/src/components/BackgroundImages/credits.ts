import boliviainteligente from "./boliviainteligente.jpg";
import kukurudziak from "./kukurudziak.jpg";
import topuzoglu from "./topuzoglu.jpg";
import tischler from "./tischler.jpg";
import grobelska from "./grobelska.jpg";
import horvath from "./topuzoglu.jpg";
import jehly from "./jehly.jpg";

export interface Image {
  image: any;
  author: string;
  origin: string;
  accentColor: string;
}

export const images: Array<Image> = [
  {
    image: boliviainteligente,
    author: "BoliviaInteligente",
    origin: "Unsplash",
    accentColor: "#361b2d",
  },
  {
    image: kukurudziak,
    author: "Max Kukurudziak",
    origin: "Unsplash",
    accentColor: "#514b3e",
  },
  {
    image: topuzoglu,
    author: "Tansu Topuzoğlu",
    origin: "Unsplash",
    accentColor: "#42382b",
  },
  {
    image: tischler,
    author: "Geio Tischler",
    origin: "Unsplash",
    accentColor: "#334749",
  },
  {
    image: grobelska,
    author: "Mariola Grobelska",
    origin: "Unsplash",
    accentColor: "#722a3d",
  },
  {
    image: horvath,
    author: "Richard Horvath",
    origin: "Unsplash",
    accentColor: "#832f28",
  },
  {
    image: jehly,
    author: "Nicolas Jehly",
    origin: "Unsplash",
    accentColor: "#40422e",
  },
];
