// lib/classifier.js

import natural from "natural";
import { trainingData } from "./trainingData.js";

const classifier = new natural.BayesClassifier();

export function trainClassifier() {
  trainingData.forEach((item) => {
    classifier.addDocument(item.text.toLowerCase(), item.label);
  });

  classifier.train();
}

export function classifyText(text) {
  return classifier.classify(text.toLowerCase());
}
