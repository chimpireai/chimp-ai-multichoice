import React, { useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions} from 'react-native';
import { Image } from 'expo-image';
import { useFonts, Lexend_100Thin, Lexend_400Regular, Lexend_700Bold } from '@expo-google-fonts/lexend';

const { width, height } = Dimensions.get('window');

const isTablet = width >= 768;
const isSmallPhone = width <= 360;
const getFontSize = (base) => {
    if (isTablet) return base * 1.3;
    if (isSmallPhone) return base * 0.9;
    return base;
};


const MultipleChoice = ({fetchAndLog}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionsAttempted, setQuestionsAttempted] = useState(0);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [disableBackForTimeout, setDisableBackForTimeout] = useState(false);
    const [fontsLoaded] = useFonts({
        Lexend_100Thin,
        Lexend_400Regular,
        Lexend_700Bold,
    });

    const shouldFetch = questionsAttempted + 4 >= questions.length;
    console.log({fontsLoaded})
    const isLoading = questionsAttempted === questions.length || !fontsLoaded;
    const currentQuestion = questions[currentQuestionIndex];

    useEffect(() => {
        const fetchQuestions = async () => {
            const response = await fetchAndLog();
            if (response) {
                setQuestions([...questions, ...response]);
            }
        };

        fetchQuestions();
    }, [shouldFetch]);

    const handleAnswer = (option) => {
        if (currentQuestionIndex !== questionsAttempted) return;
        setDisableBackForTimeout(true);

        setQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            const current = updatedQuestions[currentQuestionIndex];

            current.selectedOption = option;

            if (isCorrect(option, current.answer)) {
                setScore((prevScore) => prevScore + 1);
            }

            return updatedQuestions;
        });

        setTimeout(() => {
            setQuestionsAttempted((prev) => prev + 1);
            setCurrentQuestionIndex((prev) => prev + 1);
            setDisableBackForTimeout(false)
        }, 1200);
    };

    return isLoading ? (
        <View style={styles.loadingContainer}>
            <Image
                source={require('../assets/MonkeyStudy.gif')}
                style={styles.loadingImage}
            />
            <Text style={styles.questionText}>Generating questions...</Text>
        </View>
    ) : (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.topScreen}>
            <QuestionText
                currentQuestion={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
            />
            </View>
            <View style={styles.bottomScreen}>
                <QuestionOptions
                    questionNumber={currentQuestionIndex + 1}
                    currentQuestion={currentQuestion}
                    handleAnswer={handleAnswer}
                />
                <Text style={styles.scoreText}>
                    Your score: {score}/{questionsAttempted}
                </Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            (currentQuestionIndex === 0 || disableBackForTimeout) && styles.disabledButton,
                        ]}
                        disabled={currentQuestionIndex === 0 || disableBackForTimeout}
                        onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    >
                        <Text style={styles.navButtonText}>Prev</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            currentQuestionIndex === questionsAttempted && styles.disabledButton,
                        ]}
                        disabled={currentQuestionIndex === questionsAttempted}
                        onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    >
                        <Text style={styles.navButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const QuestionOptions = ({ questionNumber, currentQuestion = {}, handleAnswer }) => {
    const { options, selectedOption, question, answer } = currentQuestion;

    return (
        <View>
            {options.map((option, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.optionButton,
                        getOptionStyle(selectedOption, option, answer),
                    ]}
                    onPress={() => handleAnswer(option)}
                >
                    <Text style={getOptionTextStyle(selectedOption, option, answer)}>
                        {getPrefixIcon(selectedOption, option, answer)}{option}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const QuestionText = ({ currentQuestion, questionNumber }) => {
    const { question } = currentQuestion;
    return (
        <>
            <Text style={styles.questionHeader}>Question {questionNumber}</Text>
            <Text style={styles.questionText}>{question}</Text>
        </>
    );
};

const getOptionStyle = (selected, option, answer) => {
    const isCorrectOption = isCorrect(option, answer);
    const isSelected = selected === option;

    if (isCorrectOption && selected !== undefined) return [styles.optionButton, styles.correctOption];
    if (isSelected) return [styles.optionButton, styles.incorrectOption];
    return styles.optionButton;
};

const getOptionTextStyle = (selected, option, answer) => {
    const isCorrectOption = isCorrect(option, answer);
    const isSelected = selected === option;

    if ((isCorrectOption && selected !== undefined) || isSelected) {
        return styles.whiteText;
    }

    return styles.blackText;
};

const isCorrect = (option, answer) => option === answer;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: width * 0.05,
        backgroundColor: '#fff',
    },
    questionText: {
        fontFamily: "Lexend_400Regular",
        fontSize: getFontSize(16),
        color: '#607d8b',
        marginBottom: height * 0.025,
        textAlign: 'left',
        lineHeight: getFontSize(22),
    },
    questionHeader: {
        fontFamily: "Lexend_400Regular",
        fontSize: getFontSize(20),
        fontWeight: 'bold',
        color: '#263238',
        marginBottom: height * 0.015,
        alignSelf: 'flex-start',
        lineHeight: getFontSize(26),
    },
    optionButton: {
        width: '100%',
        paddingVertical: height * 0.018,
        paddingHorizontal: width * 0.03,
        backgroundColor: '#e0e0e0',
        marginVertical: height * 0.01,
        borderRadius: 8,
        alignItems: 'center',
        minHeight: 48,
    },
    optionText: {
        fontFamily: "Lexend_400Regular",
        fontSize: getFontSize(16),
        textAlign: 'center',
        lineHeight: getFontSize(22),
        color: '#000',
    },
    incorrectOption: {
        backgroundColor: '#455a64',
    },
    correctOption: {
        backgroundColor: '#66bb6a',
    },
    scoreText: {
        fontFamily: "Lexend_400Regular",
        fontSize: getFontSize(16),
        fontWeight: 'bold',
        color: '#37474f',
        marginTop: height * 0.03,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: height * 0.03,
        width: '100%',
    },
    navButton: {
        flex: 1,
        marginHorizontal: width * 0.02,
        paddingVertical: height * 0.018,
        backgroundColor: '#66bb6a',
        borderRadius: 8,
        alignItems: 'center',
    },
    navButtonText: {
        fontFamily: "Lexend_400Regular",
        fontSize: getFontSize(15),
        fontWeight: '600',
        color: '#fff',
    },
    disabledButton: {
        backgroundColor: '#bdbdbd',
    },
    blackText: {
        fontFamily: "Lexend_400Regular",
        fontSize: getFontSize(15),
        color: '#000',
    },
    whiteText: {
        fontFamily: "Lexend_400Regular",
        fontSize: getFontSize(15),
        color: '#fff',
    },
    bottomScreen: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height * 0.03,
        width: '100%',
    },
    loadingImage: {
        width: '100%',
        aspectRatio: 1,
        maxWidth: 300, // Or whatever max you prefer
        resizeMode: 'contain',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // Optional
    },
    topScreen: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: height * 0.03,
        width: '100%',
    },
});

const getPrefixIcon = (selected, option, answer) => {
    const isCorrectOption = isCorrect(option, answer);
    const isSelected = selected === option;

    if (isCorrectOption && selected !== undefined) return '✅ ';
    if (isSelected) return '❌ ';
    return '';
};

export default MultipleChoice;
