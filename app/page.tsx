import { CategoriesData, CurrentAssessment, StatesData } from '@/lib/types';
import Dashboard from '@/components/Dashboard';
import categoriesData from '@/data/categories.json';
import currentData from '@/data/current.json';
import statesData from '@/data/states.json';

export default function Home() {
  return (
    <Dashboard
      categoriesData={categoriesData as CategoriesData}
      currentData={currentData as CurrentAssessment}
      statesData={statesData as StatesData}
    />
  );
}
