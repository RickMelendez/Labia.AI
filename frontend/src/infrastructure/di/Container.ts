/**
 * Dependency Injection Container
 * Simple container for managing dependencies
 */

import { apiClient } from '../api/ApiClient';
import { OpenerApi } from '../api/endpoints/OpenerApi';
import { ResponseApi } from '../api/endpoints/ResponseApi';
import { SuggestionRepository } from '../repositories/SuggestionRepository';
import { GenerateOpenersUseCase } from '../../application/use-cases/openers/GenerateOpeners.usecase';
import { GenerateResponsesUseCase } from '../../application/use-cases/responses/GenerateResponses.usecase';
import { AgentApi } from '../api/endpoints/AgentApi';
import { AssistUseCase } from '../../application/use-cases/assistant/Assist.usecase';
import { MatchApi } from '../api/endpoints/MatchApi';
import { toastService } from '../device/ToastService';
import { hapticsService } from '../device/HapticsService';
import { clipboardService } from '../device/ClipboardService';
import { storageService } from '../storage/AsyncStorageService';

/**
 * Container for all dependencies
 * Singleton pattern - one instance for the entire app
 */
class DependencyContainer {
  // API Endpoints
  private _openerApi?: OpenerApi;
  private _responseApi?: ResponseApi;
  private _agentApi?: AgentApi;
  private _matchApi?: MatchApi;

  // Repositories
  private _suggestionRepository?: SuggestionRepository;

  // Use Cases
  private _generateOpenersUseCase?: GenerateOpenersUseCase;
  private _generateResponsesUseCase?: GenerateResponsesUseCase;
  private _assistUseCase?: AssistUseCase;

  // API Endpoints
  get openerApi(): OpenerApi {
    if (!this._openerApi) {
      this._openerApi = new OpenerApi(apiClient);
    }
    return this._openerApi;
  }

  get responseApi(): ResponseApi {
    if (!this._responseApi) {
      this._responseApi = new ResponseApi(apiClient);
    }
    return this._responseApi;
  }

  get agentApi(): AgentApi {
    if (!this._agentApi) {
      this._agentApi = new AgentApi(apiClient);
    }
    return this._agentApi;
  }

  get matchApi(): MatchApi {
    if (!this._matchApi) {
      this._matchApi = new MatchApi(apiClient);
    }
    return this._matchApi;
  }

  // Repositories
  get suggestionRepository(): SuggestionRepository {
    if (!this._suggestionRepository) {
      this._suggestionRepository = new SuggestionRepository(
        this.openerApi,
        this.responseApi
      );
    }
    return this._suggestionRepository;
  }

  // Use Cases
  get generateOpenersUseCase(): GenerateOpenersUseCase {
    if (!this._generateOpenersUseCase) {
      this._generateOpenersUseCase = new GenerateOpenersUseCase(
        this.suggestionRepository
      );
    }
    return this._generateOpenersUseCase;
  }

  get generateResponsesUseCase(): GenerateResponsesUseCase {
    if (!this._generateResponsesUseCase) {
      this._generateResponsesUseCase = new GenerateResponsesUseCase(
        this.suggestionRepository
      );
    }
    return this._generateResponsesUseCase;
  }

  get assistUseCase(): AssistUseCase {
    if (!this._assistUseCase) {
      this._assistUseCase = new AssistUseCase(this.agentApi);
    }
    return this._assistUseCase;
  }

  // Services (singletons already created)
  get toast() {
    return toastService;
  }

  get haptics() {
    return hapticsService;
  }

  get clipboard() {
    return clipboardService;
  }

  get storage() {
    return storageService;
  }

  get api() {
    return apiClient;
  }
}

// Export singleton instance
export const container = new DependencyContainer();
