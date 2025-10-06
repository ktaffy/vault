import { StatsScreen } from '../../../../src/screens/artist/StatsScreen';
import { useLocalSearchParams } from 'expo-router';

export default function StatsRoute() {
    const { id } = useLocalSearchParams();

    return <StatsScreen route={{ params: { snippetId: Number(id) } }} />;
}