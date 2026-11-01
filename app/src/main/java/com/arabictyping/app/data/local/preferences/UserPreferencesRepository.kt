package com.arabictyping.app.data.local.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "arabic_typing_prefs")

class UserPreferencesRepository(private val context: Context) {

    private object PreferencesKeys {
        val KEY_LAST_STAGE_ID = stringPreferencesKey("last_stage_id")
        val KEY_LAST_EXERCISE_ID = stringPreferencesKey("last_exercise_id")
        val KEY_LAST_MODE = stringPreferencesKey("last_mode")
        val KEY_HAPTIC_ENABLED = booleanPreferencesKey("haptic_enabled")
    }

    val lastStageId: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.KEY_LAST_STAGE_ID] ?: "stage_1"
    }

    val lastExerciseId: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.KEY_LAST_EXERCISE_ID] ?: "ex_1_1"
    }

    val lastMode: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.KEY_LAST_MODE] ?: "GUIDED"
    }

    suspend fun saveLastLocation(stageId: String, exerciseId: String, mode: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.KEY_LAST_STAGE_ID] = stageId
            preferences[PreferencesKeys.KEY_LAST_EXERCISE_ID] = exerciseId
            preferences[PreferencesKeys.KEY_LAST_MODE] = mode
        }
    }
}
