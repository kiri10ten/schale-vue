import studentData from '../assets/data/en/students.json';

export const studentMap = {};

for (const student of studentData) {
    studentMap[student.Id] = student;
}

export function getStudentById(studentId) {
    return studentMap[studentId];
}

export function* studentsGenerator() {
    for (const id in studentMap) {
        yield studentMap[id];
    }
}