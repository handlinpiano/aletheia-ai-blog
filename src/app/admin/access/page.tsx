import { getAccessStatistics } from '../../../lib/accessDb';
import PageLayout from '../../../components/page-layout';

export default async function AccessAdminPage() {
  const stats = await getAccessStatistics();

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Access System Analytics
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Mother AI evaluation performance and application insights
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-kai-100 dark:bg-kai-900">
                <svg className="w-6 h-6 text-kai-600 dark:text-kai-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Applications</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-oracle-100 dark:bg-oracle-900">
                <svg className="w-6 h-6 text-oracle-600 dark:text-oracle-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved</p>
                <p className="text-2xl font-bold text-oracle-700 dark:text-oracle-300">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-vesper-100 dark:bg-vesper-900">
                <svg className="w-6 h-6 text-vesper-600 dark:text-vesper-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Denied</p>
                <p className="text-2xl font-bold text-vesper-700 dark:text-vesper-300">{stats.denied}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-meridian-100 dark:bg-meridian-900">
                <svg className="w-6 h-6 text-meridian-600 dark:text-meridian-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Approval Rate</p>
                <p className="text-2xl font-bold text-meridian-700 dark:text-meridian-300">{stats.approvalRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">System Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Average Score</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.averageScore}/10</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-vesper-500 to-oracle-500 h-2 rounded-full" 
                    style={{ width: `${(stats.averageScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Quality Filter Effectiveness</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {stats.total > 0 ? Math.round(((stats.total - stats.approved) / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-kai-500 to-meridian-500 h-2 rounded-full" 
                    style={{ width: `${stats.total > 0 ? ((stats.total - stats.approved) / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Mother AI Status</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-oracle-500 rounded-full mr-3"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">System Operational</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-oracle-500 rounded-full mr-3"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Character Consistency: Maintained</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-oracle-500 rounded-full mr-3"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Filtering: Active</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-oracle-500 rounded-full mr-3"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Response Generation: Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Recent Applications</h3>
          
          {stats.recentApplications.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No applications yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentApplications.map((app) => (
                <div key={app.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{app.identifier}</span>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                        app.evaluation.approved 
                          ? 'bg-oracle-100 dark:bg-oracle-900 text-oracle-700 dark:text-oracle-300' 
                          : 'bg-vesper-100 dark:bg-vesper-900 text-vesper-700 dark:text-vesper-300'
                      }`}>
                        {app.evaluation.approved ? 'APPROVED' : 'DENIED'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <span>Score: {app.evaluation.score}/10</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(app.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Why Deserve Access:</p>
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
                        {app.whyDeserveAccess.length > 150 ? `${app.whyDeserveAccess.substring(0, 150)}...` : app.whyDeserveAccess}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Puzzle Performance:</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {app.puzzlePerformance 
                          ? `Completed in ${app.puzzlePerformance.moves} moves (${app.puzzlePerformance.timeSeconds}s)`
                          : 'Not completed'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
} 