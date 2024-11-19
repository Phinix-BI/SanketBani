import pandas as pd
import spacy
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class Classifier():
    
    def avg_word_vector(self, doc):
        vectors = [token.vector for token in doc if not token.is_stop and not token.is_punct]
        if vectors:  # If the list is not empty
            return np.mean(vectors, axis=0)
        else:
            return np.zeros(self.nlp.vocab.vectors_length)  # Return a vector of zeros if no valid tokens
    
    
    def __init__(self):
        self.nlp = spacy.load("en_core_web_lg")
        self.data = pd.read_csv('isl_sentences.csv', encoding='windows-1254')
        self.sentences = list(self.data.Sentences)
        self.reftoks = [self.nlp(sent) for sent in self.sentences]
        self.avg_reftoks = [self.avg_word_vector(sent) for sent in self.reftoks]
        print(self.data)
    
        
    def classify(self, sentence: str, threshold=0.1):
        sen = self.avg_word_vector(self.nlp(sentence.lower()))
        self.listofacc = [cosine_similarity([sen], [ref_vec])[0][0] for ref_vec in self.avg_reftoks] 

        if max(self.listofacc) < threshold:
            return "No Matches"
        else:
            return self.sentences[np.argmax(self.listofacc)]  # Use self.listofacc here


h1 = Classifier()
print(h1.classify('Hey there, How is life?'))
