package com.arabictyping.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.arabictyping.app.data.local.ArabicTypingDatabase
import com.arabictyping.app.data.local.entity.CurriculumStageEntity
import com.arabictyping.app.data.local.entity.ExerciseEntity
import com.arabictyping.app.data.local.entity.LearnerProgressEntity
import com.arabictyping.app.data.local.preferences.UserPreferencesRepository
import com.arabictyping.app.data.repository.ArabicTypingRepository
import com.arabictyping.app.domain.engine.TypingEngine
import com.arabictyping.app.domain.engine.TypingEngineState
import com.arabictyping.app.domain.model.Mode
import com.arabictyping.app.domain.model.ReportData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class AppViewModel(application: Application) : AndroidViewModel(application) {

    private val db = ArabicTypingDatabase.getDatabase(application)
    private val repository = ArabicTypingRepository(
        curriculumDao = db.curriculumDao(),
        progressDao = db.progressDao(),
        attemptDao = db.attemptDao()
    )
    private val preferences = UserPreferencesRepository(application)
    private val typingEngine = TypingEngine()

    val typingEngineState: StateFlow<TypingEngineState> = typingEngine.state

    val stages: StateFlow<List<CurriculumStageEntity>> = repository.getAllStages()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val learnerProgress: StateFlow<LearnerProgressEntity?> = repository.getLearnerProgress()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _currentStageExercises = MutableStateFlow<List<ExerciseEntity>>(emptyList())
    val currentStageExercises: StateFlow<List<ExerciseEntity>> = _currentStageExercises.asStateFlow()

    private val _selectedStage = MutableStateFlow<CurriculumStageEntity?>(null)
    val selectedStage: StateFlow<CurriculumStageEntity?> = _selectedStage.asStateFlow()

    private val _selectedExercise = MutableStateFlow<ExerciseEntity?>(null)
    val selectedExercise: StateFlow<ExerciseEntity?> = _selectedExercise.asStateFlow()

    private val _latestReport = MutableStateFlow<ReportData?>(null)
    val latestReport: StateFlow<ReportData?> = _latestReport.asStateFlow()

    init {
        viewModelScope.launch {
            repository.initializeDatabaseIfNeeded()
        }
    }

    fun loadStageExercises(stageId: String) {
        viewModelScope.launch {
            _selectedStage.value = repository.getStageById(stageId)
            repository.getExercisesForStage(stageId).collect { list ->
                _currentStageExercises.value = list
            }
        }
    }

    fun loadExercise(exerciseId: String) {
        viewModelScope.launch {
            val ex = repository.getExerciseById(exerciseId)
            _selectedExercise.value = ex
        }
    }

    fun startExercise(exerciseId: String, mode: Mode) {
        viewModelScope.launch {
            val ex = repository.getExerciseById(exerciseId) ?: return@launch
            val stage = repository.getStageById(ex.stageId)
            val stageTitle = stage?.title ?: "Arabic Typing"
            _selectedExercise.value = ex

            preferences.saveLastLocation(ex.stageId, ex.id, mode.name)
            typingEngine.startExercise(
                exerciseId = ex.id,
                stageTitle = stageTitle,
                targetText = ex.targetText,
                mode = mode
            )
        }
    }

    fun onKeyPress(char: Char) {
        typingEngine.handleKeyPress(char)

        val state = typingEngine.state.value
        if (state.isComplete && state.reportData != null) {
            _latestReport.value = state.reportData
            viewModelScope.launch {
                repository.recordAttempt(state.reportData)
            }
        }
    }

    fun onBackspace() {
        typingEngine.handleBackspace()
    }

    fun retryCurrentExercise() {
        val current = _selectedExercise.value ?: return
        val currentMode = typingEngineState.value.mode
        startExercise(current.id, currentMode)
    }
}
