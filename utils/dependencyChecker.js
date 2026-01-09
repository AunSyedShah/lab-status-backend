/**
 * dependencyChecker.js - Utility to check for entity dependencies before deletion
 * Prevents orphaned records and ensures data integrity
 */

import Allocation from '../models/Allocation.js';
import Batch from '../models/Batch.js';
import logger from './logger.js';

/**
 * Check if Lab has any Allocation records
 * @param {string} labId - The Lab ID to check
 * @returns {Promise<{hasDependencies: boolean, count: number, dependents: Array}>}
 */
export async function checkLabDependencies(labId) {
  try {
    const allocations = await Allocation.find({ lab: labId })
      .populate('batch')
      .populate('timeSlot')
      .select('_id batch timeSlot dayPattern createdAt');
    
    return {
      hasDependencies: allocations.length > 0,
      count: allocations.length,
      dependents: allocations.map(alloc => ({
        type: 'Allocation',
        id: alloc._id,
        details: `Batch ${alloc.batch?.code || 'Unknown'} at ${alloc.timeSlot?.name || 'Unknown'} (${alloc.dayPattern})`
      }))
    };
  } catch (error) {
    logger.error('Error checking lab dependencies', error);
    throw error;
  }
}

/**
 * Check if Faculty has any Batch records
 * @param {string} facultyId - The Faculty ID to check
 * @returns {Promise<{hasDependencies: boolean, count: number, dependents: Array}>}
 */
export async function checkFacultyDependencies(facultyId) {
  try {
    const batches = await Batch.find({ faculty: facultyId })
      .select('_id code currentSemester numberOfStudents createdAt');
    
    return {
      hasDependencies: batches.length > 0,
      count: batches.length,
      dependents: batches.map(batch => ({
        type: 'Batch',
        id: batch._id,
        details: `${batch.code} (${batch.currentSemester}, ${batch.numberOfStudents} students)`
      }))
    };
  } catch (error) {
    logger.error('Error checking faculty dependencies', error);
    throw error;
  }
}

/**
 * Check if Batch has any Allocation records
 * @param {string} batchId - The Batch ID to check
 * @returns {Promise<{hasDependencies: boolean, count: number, dependents: Array}>}
 */
export async function checkBatchDependencies(batchId) {
  try {
    const allocations = await Allocation.find({ batch: batchId })
      .populate('lab')
      .populate('timeSlot')
      .select('_id lab timeSlot dayPattern createdAt');
    
    return {
      hasDependencies: allocations.length > 0,
      count: allocations.length,
      dependents: allocations.map(alloc => ({
        type: 'Allocation',
        id: alloc._id,
        details: `Lab ${alloc.lab?.code || 'Unknown'} at ${alloc.timeSlot?.name || 'Unknown'} (${alloc.dayPattern})`
      }))
    };
  } catch (error) {
    logger.error('Error checking batch dependencies', error);
    throw error;
  }
}

/**
 * Check if Book has any Batch records (currentBook or upcomingBook)
 * @param {string} bookId - The Book ID to check
 * @returns {Promise<{hasDependencies: boolean, count: number, dependents: Array}>}
 */
export async function checkBookDependencies(bookId) {
  try {
    const batches = await Batch.find({
      $or: [
        { currentBook: bookId },
        { upcomingBook: bookId }
      ]
    }).select('_id code currentSemester currentBook upcomingBook createdAt');
    
    return {
      hasDependencies: batches.length > 0,
      count: batches.length,
      dependents: batches.map(batch => ({
        type: 'Batch',
        id: batch._id,
        details: `${batch.code} (${batch.currentSemester})${batch.currentBook?.toString() === bookId ? ' [current book]' : ''}${batch.upcomingBook?.toString() === bookId ? ' [upcoming book]' : ''}`
      }))
    };
  } catch (error) {
    logger.error('Error checking book dependencies', error);
    throw error;
  }
}

/**
 * Create a structured error response for dependency conflicts
 * @param {string} entityType - Type of entity being deleted (e.g., 'Lab', 'Faculty')
 * @param {string} entityName - Name or identifier of the entity
 * @param {Object} dependencyInfo - Result from check*Dependencies function
 * @returns {Object} Structured error object
 */
export function createDependencyConflictError(entityType, entityName, dependencyInfo) {
  return {
    code: 'DEPENDENCY_CONFLICT',
    status: 409,
    message: `Cannot delete ${entityType} "${entityName}" because it has ${dependencyInfo.count} dependent record(s)`,
    details: {
      entityType,
      entityName,
      dependencyCount: dependencyInfo.count,
      dependents: dependencyInfo.dependents,
      reason: `This ${entityType.toLowerCase()} is referenced by ${dependencyInfo.dependents.map(d => d.type).join(', ')}. Please delete or reassign these dependencies first.`
    }
  };
}
