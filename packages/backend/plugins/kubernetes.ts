import { Duration } from 'luxon';
import {
  ClusterDetails,
  KubernetesClustersSupplier,
} from '@backstage/plugin-kubernetes-node';

// kubernetes 클러스터 목록 관리
export class CustomClustersSupplier implements KubernetesClustersSupplier {
    // kubernetes 클러스터 목록 저장
    constructor(private clusterDetails: ClusterDetails[] = []) {}
  
    // 주기적으로 클러스터 목록 갱신신
    static create(refreshInterval: Duration) {
      const clusterSupplier = new CustomClustersSupplier();
      // setup refresh, e.g. using a copy of https://github.com/backstage/backstage/blob/master/plugins/kubernetes-backend/src/service/runPeriodically.ts
      runPeriodically(
        () => clusterSupplier.refreshClusters(),
        refreshInterval.toMillis(),
      );
      return clusterSupplier;
    }
  
    async refreshClusters(): Promise<void> {
      this.clusterDetails = []; // fetch from somewhere
    }
  
    // 클러스터 목록 반환
    async getClusters(): Promise<ClusterDetails[]> {
      return this.clusterDetails;
    }
}

export function runPeriodically(fn: () => any, delayMs: number): () => void {
    let cancel: () => void;
    let cancelled = false;
    const cancellationPromise = new Promise<void>(resolve => {
      cancel = () => {
        resolve();
        cancelled = true;
      };
});
  
const startRefresh = async () => {
      while (!cancelled) {
        try {
          await fn();
        } catch {
          // ignore intentionally
        }
  
        await Promise.race([
          new Promise(resolve => setTimeout(resolve, delayMs)),
          cancellationPromise,
        ]);
      }
    };
    startRefresh();
  
    return cancel!;
  }
  
  