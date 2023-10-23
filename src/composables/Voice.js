import { useDataStore } from "../stores/DataStore";

export function getVoiceById(studentId) {
    return useDataStore().voice.data[studentId];
}