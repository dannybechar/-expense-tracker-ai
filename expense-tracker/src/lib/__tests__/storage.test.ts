import { storage } from '../storage';
import { Expense } from '@/types/expense';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('storage', () => {
  const mockExpense: Expense = {
    id: '1',
    amount: 50.00,
    category: 'Food',
    description: 'Lunch',
    date: '2024-01-15',
    createdAt: '2024-01-15T12:00:00Z'
  };

  const mockExpenses: Expense[] = [mockExpense];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExpenses', () => {
    it('should return expenses from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockExpenses));
      
      const result = storage.getExpenses();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('expense-tracker-data');
      expect(result).toEqual(mockExpenses);
    });

    it('should return empty array when no data in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = storage.getExpenses();
      
      expect(result).toEqual([]);
    });

    it('should handle corrupted data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = storage.getExpenses();
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error reading from localStorage:', expect.any(SyntaxError));
      
      consoleSpy.mockRestore();
    });

    it('should return empty array when window is undefined', () => {
      const windowSpy = jest.spyOn(global, 'window', 'get').mockReturnValue(undefined as unknown as Window & typeof globalThis);
      
      const result = storage.getExpenses();
      
      expect(result).toEqual([]);
      windowSpy.mockRestore();
    });
  });

  describe('saveExpenses', () => {
    it('should save expenses to localStorage', () => {
      storage.saveExpenses(mockExpenses);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'expense-tracker-data',
        JSON.stringify(mockExpenses)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      storage.saveExpenses(mockExpenses);
      
      expect(consoleSpy).toHaveBeenCalledWith('Error saving to localStorage:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should do nothing when window is undefined', () => {
      const windowSpy = jest.spyOn(global, 'window', 'get').mockReturnValue(undefined as unknown as Window & typeof globalThis);
      
      storage.saveExpenses(mockExpenses);
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      windowSpy.mockRestore();
    });
  });

  describe('addExpense', () => {
    it('should add expense to existing expenses', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
      
      storage.addExpense(mockExpense);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'expense-tracker-data',
        JSON.stringify([mockExpense])
      );
    });
  });

  describe('updateExpense', () => {
    it('should update existing expense', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockExpenses));
      
      const updatedData = { description: 'Updated lunch' };
      storage.updateExpense('1', updatedData);
      
      const callArgs = mockLocalStorage.setItem.mock.calls[0];
      expect(callArgs[0]).toBe('expense-tracker-data');
      const savedData = JSON.parse(callArgs[1]);
      expect(savedData[0]).toMatchObject({
        ...mockExpense,
        ...updatedData
      });
      expect(savedData[0].updatedAt).toBeDefined();
    });

    it('should not update if expense not found', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockExpenses));
      
      storage.updateExpense('non-existent', { description: 'Updated' });
      
      // Should not call setItem since no update occurred
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('deleteExpense', () => {
    it('should remove expense by id', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockExpenses));
      
      storage.deleteExpense('1');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'expense-tracker-data',
        JSON.stringify([])
      );
    });

    it('should not affect array if expense not found', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockExpenses));
      
      storage.deleteExpense('non-existent');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'expense-tracker-data',
        JSON.stringify(mockExpenses)
      );
    });
  });

  describe('clearAllExpenses', () => {
    it('should remove data from localStorage', () => {
      storage.clearAllExpenses();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('expense-tracker-data');
    });

    it('should do nothing when window is undefined', () => {
      const windowSpy = jest.spyOn(global, 'window', 'get').mockReturnValue(undefined as unknown as Window & typeof globalThis);
      
      storage.clearAllExpenses();
      
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      windowSpy.mockRestore();
    });
  });
});