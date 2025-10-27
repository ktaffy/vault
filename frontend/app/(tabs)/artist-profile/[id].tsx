import { ArtistProfileScreen } from '../../../src/screens/main/ArtistProfileScreen';
import { useLocalSearchParams } from 'expo-router';

export default function ArtistProfileRoute() {
    const { id } = useLocalSearchParams();

    return <ArtistProfileScreen artistId={Number(id)} />;
}