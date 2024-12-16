# SanketBani - A ISL SignLanguage based app

SanketBani

SanketBani is an innovative application designed to bridge the communication gap between the hearing and speech-impaired communities and those who can hear and speak. It leverages advanced AI and 3D technology to convert text, images, and real-time gestures into Indian Sign Language (ISL) gestures, fostering seamless communication and understanding.

Features

1. Text-to-ISL Conversion

Converts any input text into 3D animated Indian Sign Language gestures.

Allows users to type or paste text and view the corresponding ISL gestures in real-time.

2. Image-to-ISL Conversion

Recognizes text from images and converts it into ISL gestures.

Uses advanced Optical Character Recognition (OCR) and AI models to extract and process text from images.

3. Real-Time Gesture Conversations

Facilitates real-time conversations between individuals who can and cannot hear or speak.

Provides smooth interaction using gesture recognition and 3D animated ISL responses.

4. Gesture-to-Text Conversion

Converts sign language gestures from videos into readable text.

Enables understanding of ISL gestures by those who are unfamiliar with sign language.

5. Custom Dataset

Incorporates a structured dataset of ISL gestures, including alphabets, numbers, common sentences, and frequently used words.

Expands functionality by combining gestures for new or uncommon phrases.

Technology Stack

1. Frontend

React Native for the mobile application.

Three.js for rendering 3D models.

Expo Go for development and testing.

2. Backend

Node.js (Optional if AI functions are directly handled by a model like OpenAI's Gemini 1.5 Pro).

APIs for OCR, text-to-sign gesture generation, and other AI functionalities.

3. 3D Animations

Created using Blender.

Supports up to 1000 3D gesture animations, optimized for performance.

4. AI and Machine Learning

OCR for text extraction from images.

Natural Language Processing (NLP) for restructuring and processing input text.

AI Models (e.g., Gemini 1.5 Pro) for grammar correction, dataset matching, and generating ISL sequences.

How It Works

Input Processing

User provides input via text, image, or gestures.

Text is processed to correct grammar and spelling.

If the input matches the dataset, a sequence for ISL gestures is generated.

For new inputs, the AI combines existing gestures or generates a new sequence.

Output Rendering

Processed input is converted into a series of prebuilt 3D animations.

Animations are displayed in the app’s 3D viewer for users to follow or understand.

Use Cases

Education: Helps students learn Indian Sign Language in an interactive way.

Accessibility: Enables hearing and speech-impaired individuals to communicate with those who do not know sign language.

Translation: Acts as a translator for conversations between different communities.

Awareness: Promotes ISL adoption and awareness in workplaces, schools, and public spaces.

Challenges Solved

Communication Barriers: Reduces the gap between communities with and without knowledge of ISL.

Resource Scarcity: Provides prebuilt animations for over 285+ gestures, including alphabets, numbers, and common phrases.

Ease of Use: User-friendly interface for inputting and viewing ISL gestures in various formats.

Installation

Prerequisites

Node.js

Expo Go

Blender (optional for custom animations)

Steps

Clone the repository:

git clone https://github.com/Phinix-BI/ISL-Recognition

Navigate to the project directory:

cd sanketbani

Install dependencies:

npm install

Start the development server:

expo start

Open the app using Expo Go on your mobile device.

Roadmap

Future Enhancements

Support for more languages beyond English.

Additional gesture datasets and animations.

Offline functionality for remote areas.

Integration with voice recognition for enhanced accessibility.

Contributions

We welcome contributions to enhance SanketBani. To contribute:

Fork the repository.

Create a new branch for your feature or bug fix.

Submit a pull request with a detailed description of your changes.

License

SanketBani is licensed under the MIT License. See the LICENSE file for details.

Contact

For queries, feature requests, or support:

Email: support@sanketbani.com

Website: www.sanketbani.com



